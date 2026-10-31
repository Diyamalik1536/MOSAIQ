const windows = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

export function rateLimitExtraction(req, res, next) {
  const now = Date.now();
  const key = req.student?.uid || req.ip;
  const previous = windows.get(key);
  if (!previous || now - previous.start >= WINDOW_MS) windows.set(key, { start: now, count: 1 });
  else if (previous.count >= MAX_REQUESTS) return res.status(429).json({ error: "Extraction limit reached. Wait a minute before trying again." });
  else previous.count += 1;
  if (windows.size > 1000) for (const [id, window] of windows) if (now - window.start >= WINDOW_MS) windows.delete(id);
  return next();
}
