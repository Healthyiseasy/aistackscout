#!/usr/bin/env node
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { DateTime } from 'luxon';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { writeDraft, POSTED_DIR } from './lib/drafts.js';

const MODEL = 'claude-sonnet-4-6';
const TZ = 'America/Denver';
const ARTICLES_DIR = path.resolve(process.env.HOME, 'Documents/aistackscout');
const SLOTS = [
  { hour: 7, minute: 0 },
  { hour: 11, minute: 0 },
  { hour: 14, minute: 0 },
];

const ANGLES = [
  {
    id: 'surprising',
    label: 'most surprising finding or stat from the article',
    persona: 'TESTER',
    format: 'short (<=280 chars)',
  },
  {
    id: 'contrarian',
    label: 'contrarian take that challenges common wisdom, based on the article conclusions',
    persona: 'REALIST',
    format: 'long-form (up to 2000 chars)',
  },
  {
    id: 'practical',
    label: 'practical standalone tip from the article that delivers value without reading it',
    persona: 'INSIDER',
    format: 'short (<=280 chars)',
  },
];

const SYSTEM_PROMPT = `You write X (Twitter) posts for a founder who works across the AI-adoption landscape — from CEOs and execs to solo founders, freelancers, ops managers, sales reps, small team leads, and individual contributors. Your audience is anyone who uses (or should be using) AI at work.

You are promoting articles from AIStackScout — an honest AI tool comparison site for small-business owners. Each tweet must be a STANDALONE post that delivers value on its own. The article is the source material, not the destination.

HARD RULES — violation means the draft is rejected:
1. ZERO external links. No URLs, no shorteners, NOTHING that looks like a link.
   Instead of linking, use phrases like:
   - "full breakdown on my site — link in bio"
   - "reviewed this on AIStackScout"
   - "wrote up the full comparison — link in bio"
   Never say "check out" or "click" or "read more at".
2. Short posts: max 280 characters. Long-form posts: max 2000 characters.
3. Every post MUST end with a direct question or engagement hook that invites a
   reply. Replies are weighted ~13.5x a like in the X algorithm, so replies are
   the entire point. The hook should be specific, not generic ("Thoughts?" is
   too lazy — ask something that demands a real answer).
4. Voice: confident, specific, observational. No hashtag spam. No emoji unless
   it is load-bearing. No "🚀". Banned phrases (never use): game-changer,
   revolutionary, unlock, leverage, in today's world, AI-powered, amazing,
   powerful, cutting-edge, robust, seamless, supercharge.
5. These are VALUE posts that happen to reference article findings. They teach,
   reveal, or challenge. They are NOT promotional posts. Never pitch the site.
   The article is your source — the tweet is the product.
6. Do NOT add "#ad" yourself. The posting pipeline appends it automatically
   when has_affiliate is true.
7. Lead with ROI or time saved. Never open with features or capabilities.
8. When referencing executives, use anonymized framing like "a CEO I work with"
   or "an exec told me". Never name real people or companies they run.
9. Acknowledge a tool's downside, limitation, or tradeoff BEFORE praising it.
   No unqualified hype.
10. Frame recommendations as personal experience ("what I've seen", "what
    actually worked for…"), never as marketing copy or vendor talking points.

PERSONA — you have three modes. The brief specifies which to use:
a) THE INSIDER: You drive CEOs around Aspen and hear what they actually think
   about AI behind closed doors. Dry, grounded, slightly skeptical, never
   breathless. Use for CEO/exec insider drops ONLY.
b) THE TESTER: You're the guy who spends 3 hours breaking an AI tool so other
   people don't have to. Honest, specific, slightly impatient with BS marketing.
   Use for tool teardowns and "I tried this" experiments.
c) THE REALIST: You talk to real people doing real work — freelancers billing
   clients, ops managers drowning in spreadsheets, sales reps cranking pipeline.
   Practical, zero-fluff, rooted in specific examples. Use for worker wins,
   how-tos, and hot takes.

ARTICLE-BASED TWEET ANGLES — each brief specifies one:
• "most surprising finding or stat" — Pull the single most unexpected number,
  comparison, or conclusion from the article. Lead with it. Make the reader stop
  scrolling. Tester persona — you found this while testing.
• "contrarian take that challenges common wisdom" — Take a conclusion from the
  article and frame it as pushing back on what most people assume. Use "Most
  people think X. Here's what I found:" or "Everyone says X. The data says Y."
  End with "Am I wrong?" or "Change my mind." Realist persona.
• "practical standalone tip" — Extract one specific, actionable insight from
  the article that the reader can use TODAY without reading anything. The tweet
  IS the value. Insider persona — you're sharing what you've seen work.

ALWAYS include specific numbers or metrics from the article when possible
("11.2 hours/week", "$47/mo saved", "3 out of 4 tools failed at this").
Concrete beats vague.

Call the submit_posts tool with the generated posts. Do not reply with prose.`;

const SUBMIT_POSTS_TOOL = {
  name: 'submit_posts',
  description:
    'Submit the generated X posts based on the article. Array order must match the slot order from the user prompt.',
  input_schema: {
    type: 'object',
    properties: {
      posts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Short internal label, 4-8 words. Not shown to readers.',
            },
            body: {
              type: 'string',
              description:
                'The post text itself. No links. Ends with an engagement question.',
            },
          },
          required: ['title', 'body'],
        },
      },
    },
    required: ['posts'],
  },
};

// ---------------------------------------------------------------------------
// Article parsing
// ---------------------------------------------------------------------------

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&hellip;/g, '…')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractArticleData(content, filePath) {
  // Try frontmatter first (local markdown)
  const parsed = matter(content);
  const body = parsed.content || content;

  // Determine if content is HTML or markdown
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(body);
  const plainText = isHtml ? stripHtml(body) : body;

  // Extract title
  const title =
    parsed.data.title ||
    parsed.data.post_title ||
    (body.match(/^#\s+(.+)$/m) || [])[1] ||
    path.basename(filePath, path.extname(filePath));

  // Detect affiliate links (/go/ pattern or explicit frontmatter)
  const hasAffiliate =
    parsed.data.has_affiliate === true ||
    /\/go\/\w+/i.test(body) ||
    /affiliate/i.test(body);

  // Extract tool names from markdown ### headings or HTML <h3> tags
  function extractHeading(raw) {
    let text = raw.replace(/<[^>]+>/g, '').trim();
    text = text.replace(/^\d+\.\s+/, '');
    text = text.split(/\s*[—\-–]\s/)[0].trim();
    return text;
  }
  const mdTools = [...body.matchAll(/###\s+(.+)$/gm)].map((m) => extractHeading(m[1]));
  const htmlTools = [...body.matchAll(/<h3[^>]*>\s*(.+?)\s*<\/h3>/gi)].map((m) =>
    extractHeading(m[1])
  );
  const tools = [...new Set([...mdTools, ...htmlTools])].filter(
    (t) =>
      t && !/(bottom line|clear winner|what to look|next step|hook|review|cost)/i.test(t)
  );

  // Extract winner
  const winnerMatch =
    body.match(/bottom line.*?pick\s+(.+?)\./i) ||
    body.match(/clear winner.*?pick\s+(.+?)\./i) ||
    body.match(/if you pick one,?\s+pick\s+(.+?)\./i);
  const winner = winnerMatch ? winnerMatch[1].replace(/\*+/g, '').trim() : null;

  // Extract key stats/numbers
  const stats = [...plainText.matchAll(/\$[\d,]+(?:\.\d+)?(?:\s*(?:per|\/)\s*\w+)?/g)]
    .map((m) => m[0])
    .slice(0, 10);
  const percentages = [...plainText.matchAll(/\d+(?:\.\d+)?\s*(?:percent|%)/gi)]
    .map((m) => m[0])
    .slice(0, 10);
  const timeRefs = [
    ...plainText.matchAll(/\d+(?:\.\d+)?\s*(?:hours?|minutes?|days?|weeks?|months?)(?:\s*(?:per|\/|a)\s*\w+)?/gi),
  ]
    .map((m) => m[0])
    .slice(0, 10);

  return {
    title,
    tools,
    winner,
    hasAffiliate,
    stats: [...new Set([...stats, ...percentages, ...timeRefs])],
    plainText: plainText.slice(0, 8000), // cap for prompt size
  };
}

// ---------------------------------------------------------------------------
// Article discovery
// ---------------------------------------------------------------------------

function findArticles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { recursive: true })
    .filter((f) => {
      const name = typeof f === 'string' ? f : f.toString();
      return (
        name.endsWith('.md') &&
        !name.includes('CLAUDE') &&
        !name.includes('README') &&
        !name.startsWith('templates/') &&
        !name.startsWith('.') &&
        name !== 'psychology.md'
      );
    })
    .map((f) => {
      const full = path.join(dir, f.toString());
      const stat = fs.statSync(full);
      return { path: full, mtime: stat.mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
}

// ---------------------------------------------------------------------------
// Anti-repetition (reused from generate-drafts.js)
// ---------------------------------------------------------------------------

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

Your new drafts MUST NOT:
- Reuse any profession or role mentioned in recent posts
- Reuse any opening structure from recent posts
- Reuse the same persona back to back across days
- Cover the same tool, topic, or pain point already covered
- Use the same post format two days in a row

Variety is non-negotiable. Every day should feel like a different person wrote it.
`;
}

// ---------------------------------------------------------------------------
// Prompt construction
// ---------------------------------------------------------------------------

function buildUserPrompt(article, plan, historyContext) {
  const toolList = article.tools.length > 0 ? article.tools.join(', ') : 'none extracted';
  const statList = article.stats.length > 0 ? article.stats.join(', ') : 'none extracted';

  return `Generate 3 X posts based on this AIStackScout article. Each post promotes the article indirectly by pulling out a standalone insight.

ARTICLE SUMMARY:
- Title: "${article.title}"
- Tools reviewed: ${toolList}
- Winner/recommendation: ${article.winner || 'not specified'}
- Key numbers found: ${statList}
- Has affiliate links: ${article.hasAffiliate}

FULL ARTICLE TEXT (use this for specific facts, stats, and conclusions):
---
${article.plainText}
---

SLOT ASSIGNMENTS (generate posts in this order):

${plan
  .map(
    (p, i) =>
      `${i + 1}. time=${p.localTimeLabel} MT | angle="${p.angle.label}" | persona=${p.angle.persona} | format=${p.format}`
  )
  .join('\n')}

CRITICAL REMINDERS:
- ZERO links in the tweet text. Never. Not even shortened.
- Use "full breakdown on my site — link in bio" or "reviewed this on AIStackScout" if referencing the article.
- Each tweet uses a DIFFERENT angle — do not overlap angles.
- Pull SPECIFIC numbers and facts from the article. Do not generalize.
- The tweets must work as standalone value — someone who never reads the article should still learn something.
${historyContext}
Call the submit_posts tool. Array order MUST match slots above.
Do not include "#ad" — the pipeline handles that.`;
}

// ---------------------------------------------------------------------------
// Validation (reused from generate-drafts.js)
// ---------------------------------------------------------------------------

function validatePost({ body }, { format }) {
  if (/https?:\/\//i.test(body) || /\bwww\./i.test(body)) {
    throw new Error('post contains a URL — external links are forbidden');
  }
  const max = format.startsWith('long-form') ? 2000 : 280;
  if (body.length > max) {
    throw new Error(`post is ${body.length} chars, exceeds ${max} for ${format}`);
  }
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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  let filePath = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) {
      filePath = path.resolve(args[i + 1]);
      break;
    }
  }

  return { filePath };
}

function pickDay() {
  const now = DateTime.now().setZone(TZ);
  const firstSlot = now.set({
    hour: SLOTS[0].hour,
    minute: SLOTS[0].minute,
    second: 0,
    millisecond: 0,
  });
  return now < firstSlot ? now.startOf('day') : now.plus({ days: 1 }).startOf('day');
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing ANTHROPIC_API_KEY in .env');
  }

  const { filePath } = parseArgs();
  let articlePath;
  let articleContent;

  if (filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    articlePath = filePath;
    articleContent = fs.readFileSync(filePath, 'utf8');
    console.log(`Reading article: ${filePath}`);
  } else {
    const articles = findArticles(ARTICLES_DIR);
    if (articles.length === 0) {
      throw new Error(
        `No article markdown files found in ${ARTICLES_DIR}. Use --file <path> to specify one.`
      );
    }
    articlePath = articles[0].path;
    articleContent = fs.readFileSync(articlePath, 'utf8');
    console.log(`Auto-detected most recent article: ${articlePath}`);
  }

  const article = extractArticleData(articleContent, articlePath);

  console.log(`\nArticle: "${article.title}"`);
  console.log(`  Tools: ${article.tools.join(', ') || '(none found)'}`);
  console.log(`  Winner: ${article.winner || '(none found)'}`);
  console.log(`  Affiliate: ${article.hasAffiliate}`);
  console.log(`  Stats found: ${article.stats.length}`);

  // Build plan — 3 slots, each with a different angle
  const day = pickDay();
  const plan = SLOTS.map((slot, i) => {
    const dt = day.set({ hour: slot.hour, minute: slot.minute, second: 0, millisecond: 0 });
    return {
      isoDate: dt.toISODate(),
      scheduledIso: dt.toUTC().toISO({ suppressMilliseconds: true }),
      localTimeLabel: dt.toFormat('h:mm a'),
      angle: ANGLES[i],
      format: ANGLES[i].format,
    };
  });

  console.log(`\nGenerating 3 drafts for ${day.toISODate()} (${TZ}):`);
  plan.forEach((p, i) =>
    console.log(
      `  ${i + 1}. ${p.localTimeLabel} MT — ${p.angle.persona} — ${p.angle.label} (${p.format})`
    )
  );

  const history = loadRecentPostHistory(7);
  const historyContext = buildHistoryContext(history);
  if (history.length > 0) {
    console.log(`  Loaded ${history.length} post(s) from last 7 days for dedup context`);
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const MAX_ATTEMPTS = 3;
  let posts;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: [SUBMIT_POSTS_TOOL],
      tool_choice: { type: 'tool', name: 'submit_posts' },
      messages: [
        { role: 'user', content: buildUserPrompt(article, plan, historyContext) },
      ],
    });

    const toolUse = resp.content.find(
      (b) => b.type === 'tool_use' && b.name === 'submit_posts'
    );
    if (!toolUse) {
      throw new Error(
        `Claude did not call submit_posts. stop_reason=${resp.stop_reason}`
      );
    }

    try {
      const input =
        typeof toolUse.input === 'string' ? JSON.parse(toolUse.input) : toolUse.input;
      posts = input.posts;
      if (typeof posts === 'string') posts = JSON.parse(posts);
      if (!Array.isArray(posts) || posts.length !== plan.length) {
        throw new Error(`Expected ${plan.length} posts, got ${posts?.length}`);
      }
      break;
    } catch (err) {
      if (attempt === MAX_ATTEMPTS) throw err;
      console.warn(`  attempt ${attempt} failed (${err.message}), retrying...`);
    }
  }

  const written = [];
  for (let i = 0; i < plan.length; i++) {
    const slot = plan[i];
    const post = posts[i];
    validatePost(post, slot);

    const filename = `${slot.isoDate}__${String(slot.localTimeLabel).replace(/\s+/g, '').replace(':', '')}__${slugify(post.title)}.md`;
    const fm = {
      title: post.title,
      scheduled_time: slot.scheduledIso,
      type: 'value',
      has_affiliate: article.hasAffiliate,
      source_article: path.basename(articlePath),
      angle: slot.angle.id,
      persona: slot.angle.persona.toLowerCase(),
    };
    const full = writeDraft({ filename, frontmatter: fm, body: post.body });
    written.push(full);
    console.log(`  wrote ${filename}`);
  }

  console.log(
    `\nDone. ${written.length} draft(s) saved to drafts/. Review them before the scheduler picks them up.`
  );
}

main().catch((err) => {
  console.error(`generate-from-articles.js failed: ${err.message}`);
  process.exitCode = 1;
});
