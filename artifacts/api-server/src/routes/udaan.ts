import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import cookieParser from "cookie-parser";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  UpdateProfileBody, UpdateProfileResponse, UpdatePreferencesBody, UpdatePreferencesResponse,
  GetUdaanStateResponse, GetOpportunitiesQueryParams, GetOpportunitiesResponse,
  GetConversationResponse, SendChatBody, SendChatResponse,
  EvaluateFinanceBody, EvaluateFinanceResponse, CreateExperimentBody, CreateExperimentResponse,
  GetExperimentsResponse, TransitionExperimentParams, TransitionExperimentBody, TransitionExperimentResponse,
  RecordResultsParams, RecordResultsBody, RecordResultsResponse,
  GetProvidersResponse, TestProviderBody, TestProviderResponse, ResetDemoBody, ResetDemoResponse,
} from "@workspace/api-zod";
import { defaultProfile, opportunities, type Language } from "../udaan/content";
import { prisma, ensureSession, getState, preferences, profileOf, serializeExperiment } from "../udaan/db";
import { calculate, assertTransition, financeInput, toPaise, learningFacts } from "../udaan/finance";
import { generate, providerStatuses, type ProviderId } from "../udaan/providers";
import type { Context } from "../udaan/demo";
import { isMarketQuestion, retrieveMarket } from "../udaan/market";
import voiceLabRouter, { requireVoiceLabAdmin } from "./voice-lab";

const router: IRouter = Router();
router.use("/udaan", cookieParser(process.env.SESSION_SECRET || randomUUID()));
const sessionKey = Symbol("udaanSession");
type ScopedRequest = Request & { [sessionKey]: string };
const sessionId = (req: Request) => (req as ScopedRequest)[sessionKey];
const buckets = new Map<string, { count: number; until: number }>();
router.use("/udaan", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    const origin = req.get("origin");
    const forwarded = req.get("x-forwarded-host") || req.get("host");
    if (origin && new URL(origin).host !== forwarded) {
      res.status(403).json({ error: "Cross-origin mutation rejected" }); return;
    }
  }
  let id = req.signedCookies?.udaan_session as string | undefined;
  if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
    id = randomUUID();
    res.cookie("udaan_session", id, { signed: true, httpOnly: true, sameSite: "lax", secure: req.secure || req.get("x-forwarded-proto") === "https", maxAge: 7 * 86400000, path: "/api/udaan" });
    req.signedCookies.udaan_session = id;
  }
  const now = Date.now();
  if (buckets.size > 10000) for (const [key, b] of buckets) if (b.until < now) buckets.delete(key);
  let b = buckets.get(id);
  if (!b || b.until < now) { b = { count: 0, until: now + 60000 }; buckets.set(id, b); }
  b.count += req.method === "GET" ? 0.1 : 1;
  if (b.count > 100) { res.status(429).json({ error: "Too many requests. Please wait a minute." }); return; }
  (req as ScopedRequest)[sessionKey] = id;
  await ensureSession(id);
  next();
});

router.use("/udaan/voice-lab", voiceLabRouter);
router.get("/udaan/state", async (req, res): Promise<void> => {
  res.json(GetUdaanStateResponse.parse(await getState(sessionId(req))));
});
router.patch("/udaan/profile", async (req, res): Promise<void> => {
  const data = UpdateProfileBody.parse(req.body);
  if (data.menu) for (const item of data.menu) {
    z.string().trim().min(1).max(100).parse(item.name);
    financeInput.parse({ sellingPrice: item.price, makingCost: item.cost, promotionBudget: 0, expectedUnits: 1 });
  }
  if (data.averageOrders !== undefined) z.number().int().min(0).max(100000).parse(data.averageOrders);
  for (const value of Object.values(data)) if (typeof value === "string") z.string().trim().min(1).max(1000).parse(value);
  const s = await ensureSession(sessionId(req));
  const profile = { ...profileOf(s), ...data, provenance: "Owner-confirmed edits to fictional demo profile" };
  await prisma.demoSession.update({ where: { id: s.id }, data: { profile: JSON.stringify(profile) } });
  res.json(UpdateProfileResponse.parse(profile));
});
router.patch("/udaan/preferences", async (req, res): Promise<void> => {
  const data = UpdatePreferencesBody.parse(req.body);
  const s = await prisma.demoSession.update({ where: { id: sessionId(req) }, data });
  res.json(UpdatePreferencesResponse.parse(preferences(s)));
});
router.get("/udaan/opportunities", async (req, res): Promise<void> => {
  const params = GetOpportunitiesQueryParams.parse(req.query);
  const s = await ensureSession(sessionId(req));
  res.json(GetOpportunitiesResponse.parse(opportunities(params.language ?? s.language as Language, profileOf(s))));
});
router.get("/udaan/conversation", async (req, res): Promise<void> => {
  const messages = await prisma.chatMessage.findMany({ where: { sessionId: sessionId(req) }, orderBy: { createdAt: "asc" }, take: 200 });
  res.json(GetConversationResponse.parse(messages.map((m) => ({
    id: m.id, role: m.role, content: m.content, language: m.language, provider: m.provider,
    createdAt: m.createdAt.toISOString(), ...JSON.parse(m.metadata),
  }))));
});
const chatBusy = new Set<string>();
router.post("/udaan/chat", async (req, res): Promise<void> => {
  const { message, voice } = SendChatBody.parse(req.body);
  if (voice) {
    let denied: unknown;
    requireVoiceLabAdmin(req, res, (e) => { denied = e; });
    if (denied) throw denied;
  }
  z.string().trim().min(1).parse(message);
  const id = sessionId(req);
  if (chatBusy.has(id)) { res.status(429).json({ error: "Please wait for your previous answer." }); return; }
  chatBusy.add(id);
  try {
    const s = await ensureSession(id);
    const profile = profileOf(s);
    const lang = s.language as Language;
    const experiments = await prisma.experiment.findMany({ where: { sessionId: id }, orderBy: { createdAt: "desc" }, take: 10 });
    const history = await prisma.chatMessage.findMany({ where: { sessionId: id }, orderBy: { createdAt: "desc" }, take: 8 });
    const context: Context = { profile, language: lang, voice,
      experiments: experiments.map((e) => serializeExperiment(e, lang, profile)),
      history: history.reverse().map((m) => ({ role: m.role, content: m.content })),
      ...(isMarketQuestion(message) ? { market: await retrieveMarket() } : {}),
    };
    const output = await generate(s.provider as ProviderId, message, context, id);
    const idea = opportunities(lang, profile).find((o) => o.id === output.opportunityId)!;
    const metadata = { ...output, financials: calculate(idea), ...(context.market ? { market: context.market } : {}) };
    const [, assistant] = await prisma.$transaction([
      prisma.chatMessage.create({ data: { sessionId: id, role: "user", content: message, language: lang, provider: s.provider, metadata: "{}" } }),
      prisma.chatMessage.create({ data: { sessionId: id, role: "assistant", content: output.content, language: lang, provider: s.provider, metadata: JSON.stringify(metadata) } }),
    ]);
    res.json(SendChatResponse.parse({ id: assistant.id, role: "assistant", language: lang, provider: s.provider, createdAt: assistant.createdAt.toISOString(), ...metadata }));
  } finally { chatBusy.delete(id); }
});
router.post("/udaan/evaluate", async (req, res): Promise<void> => {
  const data = EvaluateFinanceBody.parse(req.body);
  res.json(EvaluateFinanceResponse.parse(calculate(data)));
});
router.get("/udaan/experiments", async (req, res): Promise<void> => {
  const s = await ensureSession(sessionId(req));
  const rows = await prisma.experiment.findMany({ where: { sessionId: s.id }, orderBy: { createdAt: "desc" } });
  res.json(GetExperimentsResponse.parse(rows.map((e) => serializeExperiment(e, s.language as Language, profileOf(s)))));
});
router.post("/udaan/experiments", async (req, res): Promise<void> => {
  const data = CreateExperimentBody.parse(req.body);
  financeInput.parse(data);
  if (data.durationDays !== 7) { res.status(400).json({ error: "Choose a seven-day test." }); return; }
  const s = await ensureSession(sessionId(req));
  const profile = profileOf(s);
  const idea = opportunities(s.language as Language, profile).find((o) => o.id === data.opportunityId);
  if (!idea) { res.status(400).json({ error: "Unknown opportunity" }); return; }
  if (data.parentExperimentId) {
    const parent = await prisma.experiment.findFirst({ where: { id: data.parentExperimentId, sessionId: s.id, status: "Completed" } });
    if (!parent) { res.status(404).json({ error: "Completed parent experiment not found" }); return; }
  }
  const row = await prisma.experiment.create({ data: {
    sessionId: s.id, opportunityId: data.opportunityId, parentExperimentId: data.parentExperimentId,
    sellingPrice: toPaise(data.sellingPrice), makingCost: toPaise(data.makingCost), promotionBudget: toPaise(data.promotionBudget),
    expectedUnits: data.expectedUnits, durationDays: 7,
    timeline: JSON.stringify([{ status: "Draft", at: new Date().toISOString() }]),
  } });
  res.status(201).json(CreateExperimentResponse.parse(serializeExperiment(row, s.language as Language, profile)));
});
router.post("/udaan/experiments/:id/transition", async (req, res): Promise<void> => {
  const { id } = TransitionExperimentParams.parse(req.params);
  const data = TransitionExperimentBody.parse(req.body);
  if (!data.confirmed) { res.status(400).json({ error: "Explicit owner confirmation is required" }); return; }
  const s = await ensureSession(sessionId(req));
  const row = await prisma.experiment.findFirst({ where: { id, sessionId: s.id } });
  if (!row) { res.status(404).json({ error: "Experiment not found" }); return; }
  assertTransition(row.status, data.status);
  const timeline = [...JSON.parse(row.timeline), { status: data.status, at: new Date().toISOString() }];
  // Compare-and-set prevents concurrent requests skipping or overwriting lifecycle transitions.
  const updated = await prisma.experiment.updateMany({ where: { id, sessionId: s.id, status: row.status }, data: { status: data.status, timeline: JSON.stringify(timeline) } });
  if (updated.count !== 1) { res.status(409).json({ error: "Experiment changed. Refresh and retry." }); return; }
  const fresh = await prisma.experiment.findUniqueOrThrow({ where: { id } });
  res.json(TransitionExperimentResponse.parse(serializeExperiment(fresh, s.language as Language, profileOf(s))));
});
router.post("/udaan/experiments/:id/results", async (req, res): Promise<void> => {
  const { id } = RecordResultsParams.parse(req.params);
  const data = RecordResultsBody.parse(req.body);
  if (!data.confirmed) { res.status(400).json({ error: "Confirm these results before saving" }); return; }
  const s = await ensureSession(sessionId(req));
  const row = await prisma.experiment.findFirst({ where: { id, sessionId: s.id } });
  if (!row) { res.status(404).json({ error: "Experiment not found" }); return; }
  assertTransition(row.status, "Completed");
  const input = { sellingPrice: row.sellingPrice / 100, makingCost: row.makingCost / 100, promotionBudget: row.promotionBudget / 100, expectedUnits: row.expectedUnits };
  const facts = learningFacts(input, data.actualUnits, data.actualPromotionSpend);
  const timeline = [...JSON.parse(row.timeline), { status: "Completed", at: new Date().toISOString() }];
  const updated = await prisma.experiment.updateMany({ where: { id, sessionId: s.id, status: "Running" }, data: {
    status: "Completed", actualUnits: data.actualUnits, actualPromotionSpend: toPaise(data.actualPromotionSpend),
    feedback: data.feedback, observations: data.observations, synthetic: data.synthetic,
    timeline: JSON.stringify(timeline), learning: JSON.stringify(facts),
  } });
  if (updated.count !== 1) { res.status(409).json({ error: "Results have already been recorded" }); return; }
  const fresh = await prisma.experiment.findUniqueOrThrow({ where: { id } });
  res.json(RecordResultsResponse.parse(serializeExperiment(fresh, s.language as Language, profileOf(s))));
});
router.get("/udaan/providers", async (_req, res): Promise<void> => {
  res.json(GetProvidersResponse.parse(await providerStatuses()));
});
router.post("/udaan/providers/test", async (req, res): Promise<void> => {
  const { provider, confirmed } = TestProviderBody.parse(req.body);
  if (!confirmed) { res.status(400).json({ error: "Confirm before testing a provider" }); return; }
  const s = await ensureSession(sessionId(req));
  const profile = profileOf(s);
  const rows = await prisma.experiment.findMany({ where: { sessionId: s.id }, orderBy: { createdAt: "desc" }, take: 4 });
  await generate(provider, "Mere restaurant mein weekdays par customers kam aa rahe hain. Kya karun?", {
    profile, language: "hinglish", experiments: rows.map((r) => serializeExperiment(r, "hinglish", profile)), history: [],
  }, s.id);
  const status = (await providerStatuses()).find((p) => p.id === provider)!;
  res.json(TestProviderResponse.parse({ ...status, status: "connected" }));
});
router.post("/udaan/demo/reset", async (req, res): Promise<void> => {
  const { confirmed } = ResetDemoBody.parse(req.body);
  if (!confirmed) { res.status(400).json({ error: "Confirm reset. This removes only your demonstration records." }); return; }
  const id = sessionId(req);
  await prisma.$transaction([
    prisma.experiment.deleteMany({ where: { sessionId: id } }),
    prisma.chatMessage.deleteMany({ where: { sessionId: id } }),
    prisma.demoSession.update({ where: { id }, data: { profile: JSON.stringify(defaultProfile), provider: "demo" } }),
  ]);
  res.json(ResetDemoResponse.parse(await getState(id)));
});
router.use("/udaan", (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof z.ZodError || (err as { name?: string })?.name === "ZodError") {
    res.status(400).json({ error: "Please check your inputs. Use valid non-negative amounts, whole units and required fields." }); return;
  }
  const e = err as { status?: number; message?: string };
  const status = e.status && e.status >= 400 && e.status < 600 ? e.status : 500;
  // Never log provider error bodies or user/business content.
  req.log.warn({ status }, "Udaan request failed");
  res.status(status).json({ error: status === 500 ? "Something went wrong. Please retry." : e.message });
});
export default router;
