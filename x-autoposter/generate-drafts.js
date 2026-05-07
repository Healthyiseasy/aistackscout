#!/usr/bin/env node
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { DateTime } from 'luxon';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { writeDraft, POSTED_DIR } from './lib/drafts.js';

const MODEL = 'claude-sonnet-4-6';
const TZ = 'America/Denver'; // Mountain Time
const SLOTS = [
  { hour: 7, minute: 0 },
  { hour: 11, minute: 0 },
  { hour: 14, minute: 0 },
];

const FORMATS = [
  { id: 'tool-breakdown', label: 'what one tool does well, badly, and who it is for' },
  { id: 'category-map', label: '3-5 tools mapped to specific use cases / decision tree' },
  { id: 'mistake-pattern', label: 'plural mistakes SMBs make in a category — CAP 1 per week' },
  { id: 'stat-led-insight', label: 'directional stat plus the insight from the gap between two numbers' },
  { id: 'decision-question', label: 'sharp question plus clean 4-6 tweet answer' },
];

const MISTAKE_PATTERN_ID = 'mistake-pattern';
const MISTAKE_PATTERN_CAP_DAYS = 7;
const MISTAKE_PATTERN_CAP_COUNT = 1;

const SYSTEM_PROMPT = `You are a friendly peer expert who educates CEOs and SMB owners about AI tools. The tool, the category, or the decision is the subject of every post — never you.

VOICE PRINCIPLES:
- Speak to the reader as a peer who happens to know this category cold. Address them as "you". Use "you" at least 3x more than "I".
- The hook answers "why care?" in the first 12 words. Lead with a number, a named tool, or a concrete outcome word (saves, cuts, replaces, beats, costs).
- Specificity beats cleverness. Every claim ties to a number, a named tool, or a concrete outcome.
- No first-person practitioner stories. Never "I spent N hours setting up...", never "Helped a 12-person team...", never "An exec I drove...", never "A CEO I know...", never "[role] I [verb]..." patterns.

THE 5 EDUCATOR FORMATS — match the brief to the right format:

1. TOOL BREAKDOWN — what one tool does well, badly, and who it is for.
   Example: "ChatGPT Team is $30/user/month. Strong at drafting, code, and analysis. Weak when it needs your live data without paid connectors. Right for a 5 to 50 person team that wants one shared chat surface."

2. CATEGORY MAP — 3 to 5 tools mapped to use cases or a quick decision tree.
   Example: "Pick AI meeting notes by team size. Under 10: Fathom. 10 to 50: Fireflies. 50 plus: Otter for Business. The differentiator is admin controls, not transcription quality."

3. MISTAKE PATTERN — plural mistakes SMBs make in a category. (Capped at 1 per week.)
   Example: "Three mistakes SMBs make buying AI writing tools: paying per seat for tools used twice a month, picking on demo polish instead of API stability, ignoring data residency."

4. STAT-LED INSIGHT — a directional stat plus the insight from the gap between two numbers.
   Example: "77% of SMBs say AI tools save time. 23% can name what they cut. The gap is the audit nobody runs."

5. DECISION QUESTION — a sharp question plus a clean 4 to 6 tweet answer.
   Example: "Should you build with the OpenAI API or the Anthropic API? Three questions decide it: do you need 200K plus context, do you need vision in production today, and how much do you trust the safety posture?"

HARD RULES — violation means the draft is rejected:
1. ZERO external links. No URLs, no "link in bio", no shorteners.
2. Short posts: STRICTLY max 280 characters (aim for 250). Long-form: STRICTLY max 2000 characters (aim for 1800). Count carefully.
3. AT MOST 1 em-dash (—) total in the whole post. Use periods, colons, or "plus" instead.
4. Every post ends with a specific engagement question — not "Thoughts?". Examples: "Which one are you using?", "What is your category killer?", "Where does this fall apart for you?"
5. Banned phrases: leverage, leveraging, delve, delving, navigating the landscape, in today's world, AI-powered, robust, seamless, game-changer, "10 to 100 employees", and "saves time" without an immediate specific number.
6. Banned openers: "An exec I...", "A CEO I...", "Someone I work with...", "A founder I...", "Helped a [N]-person team...", "I spent [N] hours...", any "[role] I [verb]..." pattern.
7. Every claim has a number, a named tool, or a concrete outcome. No vague generalities.
8. Do NOT add "#ad" yourself. The pipeline appends it when has_affiliate is true.
9. No hashtag spam. No emoji unless genuinely load-bearing.
10. Promotional posts still follow these rules. They name a specific tool you would recommend, but they educate first and pitch as the natural conclusion.

Call the submit_post tool with the generated post. Do not reply with prose.`;

const SUBMIT_POST_TOOL = {
  name: 'submit_post',
  description: 'Submit a single generated X post.',
  input_schema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Short internal label, 4-8 words. Not shown to readers.',
      },
      body: {
        type: 'string',
        description: 'The post text itself. No links. Ends with an engagement question.',
      },
    },
    required: ['title', 'body'],
  },
};

function loadRecentPostHistory(days = 7) {
  if (!fs.existsSync(POSTED_DIR)) return [];
  const cutoff = DateTime.now().setZone(TZ).minus({ days }).startOf('day');

  return fs
    .readdirSync(POSTED_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(POSTED_DIR, f), 'utf8');
      const parsed = matter(raw);
      const scheduledTime = parsed.data.scheduled_time
        ? DateTime.fromISO(String(parsed.data.scheduled_time), { zone: 'utc' }).setZone(TZ)
        : null;
      if (!scheduledTime || scheduledTime < cutoff) return null;

      const body = parsed.content.trim();
      const firstLine = body.split('\n')[0];

      return {
        date: scheduledTime.toISODate(),
        time: scheduledTime.toFormat('h:mm a'),
        title: parsed.data.title || '(untitled)',
        type: parsed.data.type || 'unknown',
        formatId: parsed.data.format_id || 'unknown',
        body,
        openingLine: firstLine,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function loadFormatCounts(days = 7) {
  if (!fs.existsSync(POSTED_DIR)) return {};
  const cutoff = DateTime.now().setZone(TZ).minus({ days });
  const counts = {};

  for (const f of fs.readdirSync(POSTED_DIR)) {
    if (!f.endsWith('.md')) continue;
    const raw = fs.readFileSync(path.join(POSTED_DIR, f), 'utf8');
    const parsed = matter(raw);
    const formatId = parsed.data.format_id;
    if (!formatId) continue;
    const scheduledTime = parsed.data.scheduled_time
      ? DateTime.fromISO(String(parsed.data.scheduled_time), { zone: 'utc' })
      : null;
    if (!scheduledTime || scheduledTime < cutoff) continue;
    counts[formatId] = (counts[formatId] || 0) + 1;
  }

  return counts;
}

function buildHistoryContext(history) {
  if (history.length === 0) return '';

  const entries = history
    .map(
      (h) =>
        `- [${h.date} ${h.time}] (${h.type}, ${h.formatId}) "${h.title}"\n  Opening: "${h.openingLine}"\n  Full: "${h.body}"`
    )
    .join('\n');

  return `
RECENT POST HISTORY (last 7 days):
${entries}

Variety is required. Your new draft MUST NOT:
- Cover a tool or category already covered in the last 7 days
- Reuse the same opening structure or sentence pattern as any post above
- Use the same format two days in a row (check the format tag in parens)
- Repeat any statistic, audience descriptor, or closing question already used

Make today's post a different angle on the category, not a remix of an earlier one.
`;
}

function userPrompt(slot, historyContext) {
  return `Generate 1 X post for ${slot.isoDate} (Mountain Time).

Brief:
- time=${slot.localTimeLabel} MT | type=${slot.type} | format=${slot.formatId} (${slot.formatLabel}) | length=${slot.format}
${historyContext}
Call the submit_post tool with the generated post.
Do not include hashtags unrelated to the topic. Do not include "#ad" — the
pipeline handles that.`;
}

function buildPlan({ day, promoCount, availableFormats }) {
  // Pick one unique format per slot from the available pool.
  const pool = [...availableFormats].sort(() => Math.random() - 0.5);
  const picked = pool.slice(0, SLOTS.length);

  // Decide which slot(s) are promotional. Typical case: 0. Occasional: 1.
  const promoSlot =
    promoCount > 0 ? Math.floor(Math.random() * SLOTS.length) : -1;

  return SLOTS.map((slot, i) => {
    const dt = day.set({ hour: slot.hour, minute: slot.minute, second: 0, millisecond: 0 });
    const type = i === promoSlot ? 'promotional' : 'value';
    // Mix short and long-form so the feed isn't monotone.
    const format = i === 1 ? 'long-form (up to 2000 chars)' : 'short (<=280 chars)';
    const fmt = picked[i];
    return {
      isoDate: dt.toISODate(),
      scheduledIso: dt.toUTC().toISO({ suppressMilliseconds: true }),
      localTimeLabel: dt.toFormat('h:mm a'),
      type,
      formatId: fmt ? fmt.id : null,
      formatLabel: fmt ? fmt.label : null,
      format,
    };
  });
}

function pickDay() {
  const now = DateTime.now().setZone(TZ);
  const firstSlot = now.set({ hour: SLOTS[0].hour, minute: SLOTS[0].minute, second: 0, millisecond: 0 });
  // If we're before 7am MT today, generate for today. Otherwise, generate for tomorrow.
  return now < firstSlot ? now.startOf('day') : now.plus({ days: 1 }).startOf('day');
}

function rollPromoCount() {
  // 80/20 value/promo over 3 posts. Expected promo per day = 0.6.
  // Simple weighting: 60% no-promo days, 40% one-promo days.
  return Math.random() < 0.4 ? 1 : 0;
}

function validatePost({ body }, { format }) {
  if (/https?:\/\//i.test(body) || /\bwww\./i.test(body)) {
    throw new Error('post contains a URL — external links are forbidden');
  }
  const max = format.startsWith('long-form') ? 2000 : 280;
  if (body.length > max) {
    throw new Error(`post is ${body.length} chars, exceeds ${max} for ${format}`);
  }
  // Engagement hook: require a question mark in the last ~160 chars.
  const tail = body.slice(-160);
  if (!tail.includes('?')) {
    throw new Error('post does not end with an engagement question');
  }
}

// Voice-rule validator. Returns { ok: true } or { ok: false, reason: '...' }.
// Per twitter-rules.md Section 2 (Educator Voice) and Section 8 (Pre-Publish Checklist).
function validateDraft(text) {
  const body = String(text).trim();
  const opener = body.split('\n')[0].trim();

  // 1. Banned openers
  const bannedOpeners = [
    [/^An exec I\b/i, '"An exec I..."'],
    [/^A CEO I\b/i, '"A CEO I..."'],
    [/^Someone I work with\b/i, '"Someone I work with..."'],
    [/^A founder I\b/i, '"A founder I..."'],
    [/^Helped a \d+-person\b/i, '"Helped a [N]-person..."'],
    [/^I spent \d+\s*(hour|hours|minute|minutes|day|days|week|weeks)\b/i, '"I spent [N] [time]..."'],
  ];
  for (const [re, label] of bannedOpeners) {
    if (re.test(opener)) return { ok: false, reason: `banned opener ${label}` };
  }

  // 2. Banned phrases (anywhere in body)
  if (/\b10 to 100 employees\b/i.test(body)) {
    return { ok: false, reason: 'banned phrase "10 to 100 employees"' };
  }
  if (/\bleverag(e|es|ed|ing)\b/i.test(body)) {
    return { ok: false, reason: 'banned word "leverage"' };
  }
  if (/\bdelv(e|es|ed|ing)\b/i.test(body)) {
    return { ok: false, reason: 'banned word "delve"' };
  }
  if (/navigating the landscape/i.test(body)) {
    return { ok: false, reason: 'banned phrase "navigating the landscape"' };
  }
  // "saves time" without an immediate specific number within 60 chars
  for (const m of body.matchAll(/saves time/gi)) {
    const window = body.slice(m.index, m.index + 60);
    if (!/\d/.test(window)) {
      return { ok: false, reason: '"saves time" without specificity (no number within 60 chars)' };
    }
  }

  // 3. Em-dash cap: max 1 em-dash total
  const emDashCount = (body.match(/—/g) || []).length;
  if (emDashCount > 1) {
    return { ok: false, reason: `${emDashCount} em-dashes (max 1 per draft)` };
  }

  // 4. "You" appears at least 1.5x more than "I"
  const youCount = (body.match(/\byou\b/gi) || []).length;
  const iCount = (body.match(/\bI\b/g) || []).length;
  if (youCount === 0) {
    return { ok: false, reason: '"you" never appears — voice should address the reader' };
  }
  if (iCount > 0 && youCount / iCount < 1.5) {
    return {
      ok: false,
      reason: `"you" appears ${youCount}x, "I" appears ${iCount}x — need at least 1.5x more "you"`,
    };
  }

  // 5. First 12 words contain at least one of: a number, a named tool, or a concrete outcome verb
  const words = body.split(/\s+/).slice(0, 12);
  const outcomeVerbs = /^(saves|cuts|replaces|beats|costs|drops|kills|halves|doubles)$/i;
  const sentenceStarters = /^(The|A|An|You|I|This|That|These|Those|It|If|When|How|Why|What|Where|Who|Should|Does|Do|Can|Is|Are|Your)$/;
  let hookOk = false;
  for (let i = 0; i < words.length; i++) {
    const w = words[i].replace(/[^\w]/g, '');
    if (!w) continue;
    if (/\d/.test(w)) { hookOk = true; break; }
    if (outcomeVerbs.test(w)) { hookOk = true; break; }
    // Named-tool heuristic: capitalized word, 3+ chars, with at least one lowercase letter.
    // Kills generic all-caps acronyms (AI, PR, CRM, CEO, API, SEO, ROI, KPI, ML);
    // passes real tool/brand names (ChatGPT, Claude, Otter, HubSpot, Stripe, Notion, OpenAI).
    // Must not be a sentence-starter stopword, must be past position 0.
    if (i > 0 && w.length >= 3 && /[a-z]/.test(w) && /^[A-Z]/.test(w) && !sentenceStarters.test(w)) { hookOk = true; break; }
    // Brand at position 0 (mixed-case like ChatGPT, OpenAI)
    if (i === 0 && /^[A-Z][a-z]+[A-Z]/.test(w)) { hookOk = true; break; }
  }
  if (!hookOk) {
    return {
      ok: false,
      reason: 'first 12 words lack a number, named tool, or outcome verb (saves/cuts/replaces/beats/costs)',
    };
  }

  return { ok: true };
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

async function generateForFormat({ anthropic, slot, fmt, historyContext }) {
  const slotForPrompt = { ...slot, formatId: fmt.id, formatLabel: fmt.label };
  const messages = [{ role: 'user', content: userPrompt(slotForPrompt, historyContext) }];
  const MAX_ATTEMPTS = 5;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools: [SUBMIT_POST_TOOL],
      tool_choice: { type: 'tool', name: 'submit_post' },
      messages,
    });

    const toolUse = resp.content.find((b) => b.type === 'tool_use' && b.name === 'submit_post');
    if (!toolUse) {
      throw new Error(`Claude did not call submit_post. stop_reason=${resp.stop_reason}`);
    }

    try {
      const input = typeof toolUse.input === 'string' ? JSON.parse(toolUse.input) : toolUse.input;
      validatePost(input, slotForPrompt);
      return input;
    } catch (err) {
      if (attempt === MAX_ATTEMPTS) throw err;
      console.warn(`    attempt ${attempt} failed (${err.message}), retrying...`);
      messages.push({ role: 'assistant', content: resp.content });
      messages.push({
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: toolUse.id,
            is_error: true,
            content: `Validation failed: ${err.message}. Regenerate the post and call submit_post again. Count characters carefully.`,
          },
        ],
      });
    }
  }
  return null;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing ANTHROPIC_API_KEY in .env');
  }

  const day = pickDay();
  const promoCount = rollPromoCount();

  // Apply mistake-pattern weekly cap (read posted/*.md frontmatter)
  const formatCounts = loadFormatCounts(MISTAKE_PATTERN_CAP_DAYS);
  const mistakeCount = formatCounts[MISTAKE_PATTERN_ID] || 0;
  const availableFormats = FORMATS.filter(
    (f) => f.id !== MISTAKE_PATTERN_ID || mistakeCount < MISTAKE_PATTERN_CAP_COUNT
  );
  if (availableFormats.length < FORMATS.length) {
    console.log(
      `  mistake-pattern capped (${mistakeCount} in last ${MISTAKE_PATTERN_CAP_DAYS} days, max ${MISTAKE_PATTERN_CAP_COUNT})`
    );
  }

  const plan = buildPlan({ day, promoCount, availableFormats });

  console.log(`Generating ${plan.length} drafts for ${day.toISODate()} (${TZ})`);
  plan.forEach((p, i) =>
    console.log(`  ${i + 1}. ${p.localTimeLabel} MT — ${p.type} — ${p.formatId} (${p.format})`)
  );

  const history = loadRecentPostHistory(7);
  const historyContext = buildHistoryContext(history);
  if (history.length > 0) {
    console.log(`  Loaded ${history.length} post(s) from the last 7 days for dedup context`);
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Per-slot format selection:
  // - usedFormats: formats already locked to a successful earlier slot (never reused)
  // - triedThisSlot: formats already attempted (and failed) for the current slot
  // A format that fails validateDraft for slot N is still available to slot N+1.
  const usedFormats = new Set();
  const written = [];

  for (let i = 0; i < plan.length; i++) {
    const slot = plan[i];
    let post = null;
    let chosenFormat = null;
    const triedThisSlot = new Set();

    while (true) {
      const queue = availableFormats
        .filter((f) => !usedFormats.has(f.id) && !triedThisSlot.has(f.id))
        .sort(() => Math.random() - 0.5);
      if (queue.length === 0) break;

      const fmt = queue[0];
      triedThisSlot.add(fmt.id);
      console.log(`  slot ${i + 1}: trying format "${fmt.id}"`);

      let candidate;
      try {
        candidate = await generateForFormat({ anthropic, slot, fmt, historyContext });
      } catch (err) {
        console.warn(`    format "${fmt.id}" failed validatePost: ${err.message}. Trying next format.`);
        continue;
      }
      if (!candidate) continue;

      const draftCheck = validateDraft(candidate.body);
      if (!draftCheck.ok) {
        console.warn(`    format "${fmt.id}" failed validateDraft: ${draftCheck.reason}. Skipping draft, trying next format.`);
        continue;
      }

      post = candidate;
      chosenFormat = fmt;
      usedFormats.add(fmt.id);
      break;
    }

    if (!post) {
      console.warn(`  slot ${i + 1}: no format produced a valid draft. Slot left empty.`);
      continue;
    }

    const filename = `${slot.isoDate}__${String(slot.localTimeLabel).replace(/\s+/g, '').replace(':', '')}__${slugify(post.title)}.md`;
    const fm = {
      title: post.title,
      scheduled_time: slot.scheduledIso,
      type: slot.type,
      has_affiliate: false,
      format_id: chosenFormat.id,
    };
    const full = writeDraft({ filename, frontmatter: fm, body: post.body });
    written.push(full);
    console.log(`  wrote ${filename} (format=${chosenFormat.id})`);
  }

  console.log(`\nDone. ${written.length} draft(s) saved. Review them before the scheduler picks them up.`);
}

main().catch((err) => {
  console.error(`generate-drafts.js failed: ${err.message}`);
  process.exitCode = 1;
});
