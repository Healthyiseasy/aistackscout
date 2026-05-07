import fs from 'node:fs';
import path from 'node:path';

export const LOG_PATH = path.resolve('post_log.json');

export function readLog() {
  if (!fs.existsSync(LOG_PATH)) return [];
  try {
    const raw = fs.readFileSync(LOG_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`post_log.json unreadable, starting fresh: ${err.message}`);
    return [];
  }
}

export function appendLog(entry) {
  const log = readLog();
  log.push({ ...entry, logged_at: new Date().toISOString() });
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2) + '\n');
}

export function postsToday(log = readLog(), now = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  return log.filter((entry) => {
    if (!entry.posted_at) return false;
    const t = new Date(entry.posted_at);
    return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d;
  });
}

export function lastPostAt(log = readLog()) {
  const posted = log
    .filter((e) => e.posted_at)
    .map((e) => new Date(e.posted_at))
    .sort((a, b) => b - a);
  return posted[0] ?? null;
}
