const windows = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

export function rateLimitDiscovery(req, res, next) {
  const now = Date.now();
  const key = req.ip || "unknown";
  const previous = windows.get(key);
  if (!previous || now - previous.start >= WINDOW_MS) windows.set(key, { start: now, count: 1 });
  else if (previous.count >= MAX_REQUESTS) return res.status(429).json({ error: "Google Careers search limit reached. Wait a minute before refreshing listings." });
  else previous.count += 1;
  if (windows.size > 2000) for (const [id, window] of windows) if (now - window.start >= WINDOW_MS) windows.delete(id);
  return next();
}
