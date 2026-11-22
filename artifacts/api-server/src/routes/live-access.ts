import { Router, type Request, type Response } from "express";
import { GetLiveAccessResponse, UnlockLiveAccessBody } from "@workspace/api-zod";
import { passwordMatches } from "../udaan/voice-policy";
import { isProduction, presenterPassword, productionLiveEnabled, productionLimits, productionUsage } from "../udaan/live-policy";
import { prisma } from "../udaan/db";

const router = Router();
const cookieName = "udaan_presenter";
const duration = 30 * 60000;
const attempts = new Map<string, { count: number; until: number }>();
const visitor = (req: Request) => req.signedCookies.udaan_session as string;
export function presenterUnlocked(req: Request) {
  if (!isProduction()) return true;
  const grant = req.signedCookies?.[cookieName];
  if (typeof grant !== "string") return false;
  const [session, expires] = grant.split(".");
  const expiration = Number(expires);
  return session === visitor(req) && Number.isFinite(expiration)
    && expiration > Date.now() && expiration <= Date.now() + duration;
}
export function requirePresenter(req: Request) {
  if (!presenterUnlocked(req)) {
    throw Object.assign(new Error("Unlock presenter access in Settings before using paid AI. Demo Mode needs no password."), { status: 401 });
  }
}
async function status(req: Request) {
  const production = isProduction();
  const configured = presenterPassword().length >= 12;
  const unlocked = presenterUnlocked(req);
  const limits = productionLimits();
  const enabled = production && productionLiveEnabled() && limits.valid && limits.daily > 0 && limits.session > 0;
  const usage = production && unlocked && enabled ? await productionUsage(visitor(req)) : null;
  return GetLiveAccessResponse.parse({
    requiresUnlock: production, configured, enabled, unlocked,
    dailyLimit: usage?.limits.daily ?? 0, dailyRemaining: usage?.dailyRemaining ?? 0,
    sessionLimit: usage?.limits.session ?? 0, sessionRemaining: usage?.sessionRemaining ?? 0,
    ...(enabled ? { expiresAt: limits.endsAt.toISOString() } : {}),
    message: !production ? "Presenter protection applies to the production deployment. Development spending remains independently controlled."
      : !enabled ? "Production live AI is prepared but not activated. Demo Mode remains available."
      : !configured ? "Configure a presenter password in Replit production Secrets."
      : !unlocked ? "Unlock this browser for a bounded live demonstration."
      : "Presenter access expires in 30 minutes. OpenAI is primary; select Anthropic explicitly if needed. No automatic paid retry.",
  });
}
router.get("/", async (req, res) => { res.json(await status(req)); });
router.post("/login", async (req, res) => {
  const secure = req.secure || req.get("x-forwarded-proto") === "https";
  if (isProduction() && !secure) { res.status(403).json({ error: "HTTPS is required." }); return; }
  if (presenterPassword().length < 12) { res.status(503).json({ error: "Presenter access is not configured. Use Demo Mode." }); return; }
  const ip = req.ip ?? "unknown"; const now = Date.now();
  if (attempts.size > 1000) for (const [key, attempt] of attempts) if (attempt.until <= now) attempts.delete(key);
  const previous = attempts.get(ip);
  const attempt = previous && previous.until > now ? previous : { count: 0, until: now + 15 * 60000 };
  attempt.count++; attempts.set(ip, attempt);
  if (attempt.count > 5) { res.status(429).json({ error: "Too many unlock attempts. Wait 15 minutes." }); return; }
  const { password } = UnlockLiveAccessBody.parse(req.body);
  if (!passwordMatches(password, presenterPassword())) { res.status(401).json({ error: "Presenter password not accepted." }); return; }
  attempts.delete(ip);
  const expires = Date.now() + duration;
  const value = `${visitor(req)}.${expires}`;
  res.cookie(cookieName, value, { signed: true, httpOnly: true, sameSite: "strict", secure, maxAge: duration, path: "/api/udaan" });
  // signedCookies is request-local; do not return or store the grant in JS.
  req.signedCookies[cookieName] = value;
  res.json(await status(req));
});
router.post("/logout", async (req, res: Response) => {
  res.clearCookie(cookieName, { path: "/api/udaan" });
  delete req.signedCookies[cookieName];
  await prisma.demoSession.update({ where: { id: visitor(req) }, data: { provider: "demo" } });
  res.json(await status(req));
});
export default router;
