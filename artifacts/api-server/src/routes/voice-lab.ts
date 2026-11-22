import { Router, raw, type Request, type Response, type NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { prisma } from "../udaan/db";
import { passwordMatches } from "../udaan/voice-policy";
import { sarvamRequest, voiceOperation, voiceBusy } from "../udaan/sarvam";
import {
  GetVoiceLabStatusResponse, LoginVoiceLabBody, AuthorizeVoiceLabBody,
  TestVoiceLabConnectionBody, SynthesizeVoiceBody, TranscribeVoiceQueryParams, TestVoiceLabConnectionResponse,
} from "@workspace/api-zod";
const router = Router();
const cookieName = "udaan_voice_admin";
const cookiePath = "/api/udaan";
const adminSessions = new Map<string, { expires: number; session: string }>();
export function voiceLabEnabled() { return process.env.NODE_ENV === "development" && process.env.ENABLE_SARVAM_LAB !== "false"; }
const authConfigured = () => (process.env.VOICE_LAB_ADMIN_PASSWORD?.length ?? 0) >= 12 && !!process.env.SESSION_SECRET;
function admin(req: Request) {
  const value = req.signedCookies?.[cookieName];
  if (typeof value !== "string") return false;
  const [id, expires, session] = value.split(".");
  const grant = adminSessions.get(id);
  return !!grant && grant.expires === Number(expires) && grant.expires > Date.now()
    && grant.session === session && session === req.signedCookies?.udaan_session;
}
export function requireVoiceLabAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!voiceLabEnabled()) return next(Object.assign(new Error("Voice Lab is available only in development."), { status: 404 }));
  if (!authConfigured() || !admin(req)) return next(Object.assign(new Error("Unlock the internal Voice Lab with its separate admin password."), { status: 401 }));
  next();
}
async function status(req: Request) {
  const access = !voiceLabEnabled() ? "disabled" : authConfigured() && admin(req) ? "admin" : "locked";
  if (access !== "admin") return GetVoiceLabStatusResponse.parse({ access, state: "not_configured", configured: false,
    setupRequired: voiceLabEnabled() && !authConfigured(), paidEnabled: false, maxRequests: 0, usedRequests: 0, estimatedCostInr: 0, requests: [] });
  const config = await prisma.voiceLabConfig.upsert({ where: { id: "singleton" }, create: {}, update: {} });
  const [requests, used, aggregate] = await Promise.all([
    prisma.voiceRequest.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.voiceRequest.count(), prisma.voiceRequest.aggregate({ _sum: { estimatedCostPaise: true } }),
  ]);
  const configured = !!process.env.SARVAM_API_KEY;
  const last = requests[0];
  return GetVoiceLabStatusResponse.parse({ access, configured, setupRequired: false,
    state: !configured ? "not_configured" : last?.status === "connected" ? "connected" : last?.status === "error" ? "error" : "ready_to_test",
    paidEnabled: config.paidEnabled, maxRequests: config.maxRequests, usedRequests: used,
    estimatedCostInr: (aggregate._sum.estimatedCostPaise ?? 0) / 100, requests: requests.map(voiceOperation) });
}
router.get("/status", async (req, res) => { res.json(await status(req)); });
const attempts = new Map<string, { count: number; until: number }>();
router.post("/login", async (req, res) => {
  if (!voiceLabEnabled() || !authConfigured()) { res.status(503).json({ error: "Configure VOICE_LAB_ADMIN_PASSWORD (at least 12 characters) and SESSION_SECRET in Replit Secrets. Lab stays disabled in production." }); return; }
  const local = req.hostname === "localhost" || req.hostname === "127.0.0.1";
  const secure = req.secure || req.get("x-forwarded-proto") === "https";
  if (!secure && !local) { res.status(403).json({ error: "HTTPS is required for admin login." }); return; }
  const ip = req.ip ?? "unknown";
  if (attempts.size > 1000) for (const [k, v] of attempts) if (v.until < Date.now()) attempts.delete(k);
  const existing = attempts.get(ip);
  const bucket = existing && existing.until > Date.now() ? existing : { count: 0, until: Date.now() + 15 * 60000 };
  bucket.count++; attempts.set(ip, bucket);
  if (bucket.count > 5) { res.status(429).json({ error: "Too many admin login attempts. Wait 15 minutes." }); return; }
  const { password } = LoginVoiceLabBody.parse(req.body);
  if (!passwordMatches(password, process.env.VOICE_LAB_ADMIN_PASSWORD!)) { res.status(401).json({ error: "Admin password not accepted." }); return; }
  attempts.delete(ip);
  for (const [id, grant] of adminSessions) if (grant.expires <= Date.now()) adminSessions.delete(id);
  const grantId = randomUUID(); const expires = Date.now() + 30 * 60000;
  const session = req.signedCookies.udaan_session as string;
  adminSessions.set(grantId, { expires, session });
  const value = `${grantId}.${expires}.${session}`;
  res.cookie(cookieName, value, { signed: true, httpOnly: true, secure, sameSite: "strict", maxAge: 30 * 60000, path: cookiePath });
  // The new cookie is not in this request yet; return no admin data until a subsequent authenticated GET.
  res.json(await status(req));
});
router.post("/logout", (req, res) => {
  const grantId = String(req.signedCookies?.[cookieName] ?? "").split(".")[0];
  adminSessions.delete(grantId);
  res.clearCookie(cookieName, { path: cookiePath, httpOnly: true, sameSite: "strict" });
  res.json({ access: voiceLabEnabled() ? "locked" : "disabled", state: "not_configured", configured: false, setupRequired: !authConfigured(), paidEnabled: false,
    maxRequests: 0, usedRequests: 0, estimatedCostInr: 0, requests: [] });
});
router.use(requireVoiceLabAdmin);
router.patch("/authorization", async (req, res) => {
  const data = AuthorizeVoiceLabBody.parse(req.body);
  if (!data.confirmed || (data.enabled && !data.creditCoverageConfirmed)) { res.status(400).json({ error: "Confirm the spending cap and that your credits cover these Model APIs." }); return; }
  if (voiceBusy()) { res.status(409).json({ error: "Wait for the active speech request before changing authorization." }); return; }
  const used = await prisma.voiceRequest.count();
  if (data.enabled && data.maxRequests <= used) { res.status(400).json({ error: "The total cap must exceed attempts already used; prior attempts are never reset." }); return; }
  await prisma.voiceLabConfig.upsert({ where: { id: "singleton" }, create: { paidEnabled: data.enabled, maxRequests: data.maxRequests },
    update: { paidEnabled: data.enabled, maxRequests: data.maxRequests } });
  res.json(await status(req));
});
router.post("/test", async (req, res) => {
  if (!TestVoiceLabConnectionBody.parse(req.body).confirmed) { res.status(400).json({ error: "Confirm this one potentially billable provider request." }); return; }
  const result = await sarvamRequest("tts", "en", "Hello.");
  // Connection test deliberately discards transient speech; a replay requires no new call in TTS tests.
  const metadata = TestVoiceLabConnectionResponse.parse(result);
  delete metadata.audioBase64; delete metadata.audioMime;
  res.json(metadata);
});
router.post("/transcribe", raw({ type: "application/octet-stream", limit: 320044 }), async (req, res) => {
  const query = TranscribeVoiceQueryParams.parse(req.query);
  if (String(req.query.confirmed) !== "true" || !query.confirmed) { res.status(400).json({ error: "Confirm the speech transcription request." }); return; }
  if (!Buffer.isBuffer(req.body)) { res.status(400).json({ error: "Upload the recorded PCM WAV as application/octet-stream." }); return; }
  res.json(TestVoiceLabConnectionResponse.parse(await sarvamRequest("stt", query.language, req.body)));
});
router.post("/synthesize", async (req, res) => {
  const data = SynthesizeVoiceBody.parse(req.body);
  if (!data.confirmed) { res.status(400).json({ error: "Confirm the speech generation request." }); return; }
  res.json(TestVoiceLabConnectionResponse.parse(await sarvamRequest("tts", data.language, data.text.trim())));
});
export default router;
