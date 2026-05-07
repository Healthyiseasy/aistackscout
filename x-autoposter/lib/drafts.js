import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export const DRAFTS_DIR = path.resolve('drafts');
export const POSTED_DIR = path.resolve('posted');

export function listDrafts() {
  if (!fs.existsSync(DRAFTS_DIR)) return [];
  return fs
    .readdirSync(DRAFTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(DRAFTS_DIR, f));
}

export function readDraft(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(raw);
  const { title, scheduled_time, type, has_affiliate } = parsed.data;

  if (!scheduled_time) {
    throw new Error(`${path.basename(filePath)}: missing scheduled_time`);
  }
  if (type !== 'value' && type !== 'promotional') {
    throw new Error(
      `${path.basename(filePath)}: type must be "value" or "promotional", got "${type}"`
    );
  }

  return {
    filePath,
    title: title ?? '(untitled)',
    scheduledTime: new Date(scheduled_time),
    type,
    hasAffiliate: has_affiliate === true,
    body: parsed.content.trim(),
    frontmatter: parsed.data,
  };
}

export function loadAllDrafts() {
  return listDrafts()
    .map((p) => {
      try {
        return readDraft(p);
      } catch (err) {
        console.error(`Skipping ${path.basename(p)}: ${err.message}`);
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.scheduledTime - b.scheduledTime);
}

export function nextDueDraft(now = new Date()) {
  return loadAllDrafts().find((d) => d.scheduledTime <= now) ?? null;
}

export function buildPostText(draft) {
  const base = draft.body.trim();
  if (!draft.hasAffiliate) return base;
  // Avoid double-tagging if the author already included #ad anywhere.
  if (/\B#ad\b/i.test(base)) return base;
  return `${base}\n\n#ad`;
}

export function writeDraft({ dirname = DRAFTS_DIR, filename, frontmatter, body }) {
  if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });
  const serialized = matter.stringify(body.trim() + '\n', frontmatter);
  const full = path.join(dirname, filename);
  fs.writeFileSync(full, serialized);
  return full;
}

export function moveToPosted(draft, tweetId) {
  if (!fs.existsSync(POSTED_DIR)) fs.mkdirSync(POSTED_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const base = path.basename(draft.filePath, '.md');
  const newName = `${stamp}__${base}__${tweetId}.md`;
  const target = path.join(POSTED_DIR, newName);
  fs.renameSync(draft.filePath, target);
  return target;
}
