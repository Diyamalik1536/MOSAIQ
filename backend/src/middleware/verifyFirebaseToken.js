import { getFirebaseAdminAuth } from "../config/firebaseAdmin.js";
import process from "node:process";

export function createFirebaseTokenVerifier(authProvider = getFirebaseAdminAuth) {
  return async function verifyFirebaseToken(req, res, next) {
    const match = (req.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ error: "Sign in to use Google career matching." });
    try {
      const decoded = await authProvider().verifyIdToken(match[1], true);
      req.student = { uid: decoded.uid, email: decoded.email ?? null };
      return next();
    } catch {
      const configured = authProvider !== getFirebaseAdminAuth || Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID);
      return res.status(configured ? 401 : 503).json({ error: configured ? "Your sign-in session could not be verified. Sign in again and retry." : "The Analytics backend has not been configured with Firebase Admin credentials." });
    }
  };
}

export const verifyFirebaseToken = createFirebaseTokenVerifier();
