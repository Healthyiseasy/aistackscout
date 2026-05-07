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

const TOPICS = [
  { id: 'tool-test', label: 'tool testing field report' },
  { id: 'implementation', label: 'implementation story with real timeline and results' },
  { id: 'comparison', label: 'honest head-to-head tool comparison' },
  { id: 'how-to', label: 'practical how-to with a specific AI tool' },
  { id: 'reality-check', label: 'industry reality check cutting through noise' },
  { id: 'cost-breakdown', label: 'real cost breakdown with hidden fees exposed' },
];

const SYSTEM_PROMPT = `You are a solo founder who runs an AI tools review site. You spend your days actually installing, configuring, testing, and implementing AI tools — for yourself and for small businesses you work with. You're not a thought leader. You're the guy who gets his hands dirty with the actual software and tells people what's worth their money.

VOICE: Write like a practitioner, not a pundit. You've used the tool. You've hit the bugs. You've seen the onboarding friction. You know what the pricing page doesn't tell you. Direct, specific, slightly impatient with hype.

CONTENT PILLARS — match the topic brief to the right pillar:

1. TOOL TESTING (topic: "tool testing field report"):
   "I spent 2 hours setting up [tool] for [specific task]. Here's what actually happened."
   First-person, specific results, real friction points. Not a review — a field report.

2. IMPLEMENTATION STORIES (topic: "implementation story"):
   "Helped a 12-person marketing team switch from [old way] to [new tool]. Week 1 was rough. By week 3 they cut reporting time by 6 hours."
   Real scenarios, real timelines, real results. Never name the company.

3. HONEST COMPARISONS (topic: "honest head-to-head tool comparison"):
   "Everyone says [popular tool] is the best. I tested it against [lesser known tool] on the same task. The cheaper one won and it wasn't close."
   Specific task, specific outcome, specific price difference.

4. PRACTICAL HOW-TOS (topic: "practical how-to"):
   "Here's exactly how I use [tool] every morning in under 5 minutes. Step 1..."
   Actionable, copy-paste useful, no filler.

5. INDUSTRY REALITY CHECKS (topic: "industry reality check"):
   "The AI tool market has 47 project management tools now. I've tested 9 of them. Only 2 are worth paying for."
   Cut through noise with real experience.

6. COST BREAKDOWNS (topic: "real cost breakdown"):
   "Everyone talks about AI ROI but nobody shows the real math. Here's what [tool] actually costs a 15-person team per year including the hidden stuff."
   Real numbers, real pricing tiers, real gotchas.

HARD RULES — violation means the draft is rejected:
1. ZERO external links. No URLs, no "link in bio", no shorteners, nothing.
2. Short posts: STRICTLY max 280 characters (aim for 250 to be safe). Long-form posts: STRICTLY max 2000 characters (aim for 1800 to be safe). Count carefully — posts exceeding these limits are rejected.
3. Never use quoted dialogue from unnamed people. Never start a post with "Overheard" or "A CEO told me" or any variation of attributed quotes.
4. Every claim must sound like something you personally experienced or tested.
5. No post can sound like a LinkedIn motivational post. No inspiration, no "here's what I learned about life" energy.
6. Specific numbers in EVERY post — hours saved, dollars spent, team size, days tested, tools compared. Concrete beats vague always.
7. Every post MUST end with a specific engagement question — NOT "Thoughts?" Use questions like "What are you using instead?", "Anyone else hit this?", "Am I the only one who thinks this?", "What's your actual monthly cost?"
8. Banned phrases (never use): game-changer, revolutionary, unlock, leverage, in today's world, AI-powered, deep dive, comprehensive, robust.
9. No hashtag spam. No emoji unless it is genuinely load-bearing. No "🚀".
10. Value posts teach, reveal, or challenge. Promotional posts pitch a product, service, or affiliate offer — but still must deliver a concrete insight before the pitch.
11. Do NOT add "#ad" yourself. The posting pipeline appends it automatically when has_affiliate is true.
12. Acknowledge a tool's downside, limitation, or tradeoff BEFORE praising it. No unqualified hype. Every tool has a catch — mention it.
13. Frame everything as personal experience ("I tested", "I set up", "I watched a team struggle with"). Never sound like marketing copy or vendor talking points.

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
        body,
        openingLine: firstLine,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildHistoryContext(history) {
  if (history.length === 0) return '';

  const entries = history
    .map(
      (h) =>
        `- [${h.date} ${h.time}] (${h.type}) "${h.title}"\n  Opening: "${h.openingLine}"\n  Full: "${h.body}"`
    )
    .join('\n');

  return `
RECENT POST HISTORY (last 7 days):
${entries}

Here are the posts from the last 7 days. Your new drafts MUST NOT:
- Reuse any profession or role mentioned (if last week had freelance copywriter, do NOT use freelance copywriter again)
- Reuse any opening structure (if a post started with "A freelance...", no post can start with "A [role]..." pattern)
- Reuse the same persona back to back across days (if yesterday ended with Insider, today cannot start with Insider)
- Cover the same tool, topic, or pain point already covered in the last 7 days
- Use the same post format two days in a row (if yesterday had a contrarian take, today cannot lead with a contrarian take)

Variety is non-negotiable. Every day should feel like a different person wrote it.
`;
}

function userPrompt(slot, historyContext) {
  return `Generate 1 X post for ${slot.isoDate} (Mountain Time).

Brief:
- time=${slot.localTimeLabel} MT | type=${slot.type} | topic="${slot.topic}" | format=${slot.format}
${historyContext}
Call the submit_post tool with the generated post.
Do not include hashtags unrelated to the topic. Do not include "#ad" — the
pipeline handles that.`;
}

function buildPlan({ day, promoCount }) {
  // Pick 3 unique topics, respecting maxPerDay constraints.
  const pool = [...TOPICS].sort(() => Math.random() - 0.5);
  const picked = [];
  const idCounts = {};
  for (const t of pool) {
    if (picked.length >= SLOTS.length) break;
    const count = idCounts[t.id] || 0;
    if (t.maxPerDay && count >= t.maxPerDay) continue;
    picked.push(t);
    idCounts[t.id] = count + 1;
  }

  // Decide which slot(s) are promotional. Typical case: 0. Occasional: 1.
  const promoSlot =
    promoCount > 0 ? Math.floor(Math.random() * SLOTS.length) : -1;

  return SLOTS.map((slot, i) => {
    const dt = day.set({ hour: slot.hour, minute: slot.minute, second: 0, millisecond: 0 });
    const type = i === promoSlot ? 'promotional' : 'value';
    // Mix short and long-form so the feed isn't monotone.
    const format = i === 1 ? 'long-form (up to 2000 chars)' : 'short (<=280 chars)';
    return {
      isoDate: dt.toISODate(),
      scheduledIso: dt.toUTC().toISO({ suppressMilliseconds: true }),
      localTimeLabel: dt.toFormat('h:mm a'),
      type,
      topic: picked[i].label,
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

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing ANTHROPIC_API_KEY in .env');
  }

  const day = pickDay();
  const promoCount = rollPromoCount();
  const plan = buildPlan({ day, promoCount });

  console.log(`Generating ${plan.length} drafts for ${day.toISODate()} (${TZ})`);
  plan.forEach((p, i) =>
    console.log(`  ${i + 1}. ${p.localTimeLabel} MT — ${p.type} — ${p.topic} (${p.format})`)
  );

  const history = loadRecentPostHistory(7);
  const historyContext = buildHistoryContext(history);
  if (history.length > 0) {
    console.log(`  Loaded ${history.length} post(s) from the last 7 days for dedup context`);
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const MAX_ATTEMPTS = 5;
  const written = [];

  for (let i = 0; i < plan.length; i++) {
    const slot = plan[i];
    let post;

    const messages = [{ role: 'user', content: userPrompt(slot, historyContext) }];

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
        validatePost(input, slot);
        post = input;
        break;
      } catch (err) {
        if (attempt === MAX_ATTEMPTS) throw err;
        console.warn(`  slot ${i + 1} attempt ${attempt} failed (${err.message}), retrying...`);
        messages.push({ role: 'assistant', content: resp.content });
        messages.push({
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: toolUse.id,
              is_error: true,
              content: `Validation failed: ${err.message}. Regenerate the post and call submit_post again. Count characters carefully — the body must satisfy the format constraint.`,
            },
          ],
        });
      }
    }

    const filename = `${slot.isoDate}__${String(slot.localTimeLabel).replace(/\s+/g, '').replace(':', '')}__${slugify(post.title)}.md`;
    const fm = {
      title: post.title,
      scheduled_time: slot.scheduledIso,
      type: slot.type,
      has_affiliate: false,
    };
    const full = writeDraft({ filename, frontmatter: fm, body: post.body });
    written.push(full);
    console.log(`  wrote ${filename}`);
  }

  console.log(`\nDone. ${written.length} draft(s) saved. Review them before the scheduler picks them up.`);
}

main().catch((err) => {
  console.error(`generate-drafts.js failed: ${err.message}`);
  process.exitCode = 1;
});
