#!/usr/bin/env node
import 'dotenv/config';
import path from 'node:path';
import { makeClient } from './lib/twitter.js';
import {
  nextDueDraft,
  readDraft,
  buildPostText,
  moveToPosted,
} from './lib/drafts.js';
import { appendLog, postsToday, lastPostAt } from './lib/logger.js';

const MAX_POSTS_PER_DAY = 3;
const MIN_SPACING_MS = 2 * 60 * 60 * 1000; // 2 hours
const LONG_FORM_MAX = 2000;
const SHORT_MAX = 280;

function enforceRateLimits() {
  const today = postsToday();
  if (today.length >= MAX_POSTS_PER_DAY) {
    throw new Error(
      `Daily cap reached: ${today.length}/${MAX_POSTS_PER_DAY} posts already today.`
    );
  }
  const last = lastPostAt();
  if (last) {
    const gap = Date.now() - last.getTime();
    if (gap < MIN_SPACING_MS) {
      const mins = Math.ceil((MIN_SPACING_MS - gap) / 60000);
      throw new Error(
        `Too soon: last post was ${Math.floor(gap / 60000)}m ago. ` +
          `Wait ${mins}m to respect the 2-hour minimum spacing.`
      );
    }
  }
}

function validateLength(text) {
  if (text.length > LONG_FORM_MAX) {
    throw new Error(
      `Post is ${text.length} chars, exceeds long-form max of ${LONG_FORM_MAX}.`
    );
  }
  return {
    length: text.length,
    requiresLongForm: text.length > SHORT_MAX,
  };
}

async function main() {
  const explicit = process.argv[2];
  const draft = explicit
    ? readDraft(path.resolve(explicit))
    : nextDueDraft();

  if (!draft) {
    console.log('No draft is due. Nothing to post.');
    return;
  }

  enforceRateLimits();

  const text = buildPostText(draft);
  const meta = validateLength(text);

  console.log(`Posting: ${path.basename(draft.filePath)}`);
  console.log(`  title:       ${draft.title}`);
  console.log(`  scheduled:   ${draft.scheduledTime.toISOString()}`);
  console.log(`  type:        ${draft.type}`);
  console.log(`  affiliate:   ${draft.hasAffiliate}`);
  console.log(`  length:      ${meta.length} chars`);

  const client = makeClient();
  const res = await client.v2.tweet(text);
  const tweetId = res.data?.id;
  if (!tweetId) {
    throw new Error(`Tweet call returned no id: ${JSON.stringify(res)}`);
  }

  const newPath = moveToPosted(draft, tweetId);
  appendLog({
    tweet_id: tweetId,
    title: draft.title,
    type: draft.type,
    has_affiliate: draft.hasAffiliate,
    length: meta.length,
    source_draft: path.basename(draft.filePath),
    archived_to: path.relative(process.cwd(), newPath),
    scheduled_time: draft.scheduledTime.toISOString(),
    posted_at: new Date().toISOString(),
  });

  console.log(`Posted. tweet_id=${tweetId}`);
  console.log(`Archived: ${path.relative(process.cwd(), newPath)}`);
}

main().catch((err) => {
  console.error(`post.js failed: ${err.message}`);
  process.exitCode = 1;
});
