#!/usr/bin/env node
import 'dotenv/config';
import path from 'node:path';
import { makeClient } from './lib/twitter.js';
import { nextDueDraft, buildPostText, moveToPosted } from './lib/drafts.js';
import { appendLog, postsToday, lastPostAt } from './lib/logger.js';

const POLL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_POSTS_PER_DAY = 3;
const MIN_SPACING_MS = 2 * 60 * 60 * 1000;
const LONG_FORM_MAX = 2000;

function rateLimitBlocker() {
  const today = postsToday();
  if (today.length >= MAX_POSTS_PER_DAY) {
    return `daily cap reached (${today.length}/${MAX_POSTS_PER_DAY})`;
  }
  const last = lastPostAt();
  if (last) {
    const gap = Date.now() - last.getTime();
    if (gap < MIN_SPACING_MS) {
      const mins = Math.ceil((MIN_SPACING_MS - gap) / 60000);
      return `minimum 2h spacing — ${mins}m remaining`;
    }
  }
  return null;
}

async function tick() {
  const stamp = new Date().toISOString();
  const draft = nextDueDraft();
  if (!draft) {
    console.log(`[${stamp}] no draft due`);
    return;
  }

  const blocker = rateLimitBlocker();
  if (blocker) {
    console.log(`[${stamp}] skipping ${path.basename(draft.filePath)}: ${blocker}`);
    return;
  }

  const text = buildPostText(draft);
  if (text.length > LONG_FORM_MAX) {
    console.error(
      `[${stamp}] ${path.basename(draft.filePath)} is ${text.length} chars, exceeds ${LONG_FORM_MAX}. Leaving in drafts/ for manual review.`
    );
    return;
  }

  try {
    const client = makeClient();
    const res = await client.v2.tweet(text);
    const tweetId = res.data?.id;
    if (!tweetId) throw new Error(`tweet call returned no id: ${JSON.stringify(res)}`);

    const newPath = moveToPosted(draft, tweetId);
    appendLog({
      tweet_id: tweetId,
      title: draft.title,
      type: draft.type,
      has_affiliate: draft.hasAffiliate,
      length: text.length,
      source_draft: path.basename(draft.filePath),
      archived_to: path.relative(process.cwd(), newPath),
      scheduled_time: draft.scheduledTime.toISOString(),
      posted_at: new Date().toISOString(),
      posted_by: 'scheduler',
    });
    console.log(`[${stamp}] posted ${path.basename(draft.filePath)} as ${tweetId}`);
  } catch (err) {
    console.error(`[${stamp}] post failed: ${err.message}`);
  }
}

async function main() {
  console.log(`scheduler started, polling every ${POLL_MS / 60000}m`);
  await tick();
  setInterval(tick, POLL_MS);
}

main().catch((err) => {
  console.error(`scheduler crashed: ${err.message}`);
  process.exit(1);
});
