#!/usr/bin/env node
import 'dotenv/config';
import { makeClient } from './lib/twitter.js';

const LIMIT = Number(process.argv[2] ?? 10);

function fmt(n) {
  return String(n ?? 0).padStart(5);
}

async function main() {
  const client = makeClient();
  const me = await client.v2.me();
  const userId = me.data.id;
  const username = me.data.username;

  const timeline = await client.v2.userTimeline(userId, {
    max_results: Math.min(Math.max(LIMIT, 5), 100),
    exclude: ['retweets', 'replies'],
    'tweet.fields': ['created_at', 'public_metrics', 'text'],
  });

  const tweets = timeline.data?.data ?? [];
  if (tweets.length === 0) {
    console.log(`no recent original tweets for @${username}`);
    return;
  }

  console.log(`recent posts for @${username} (${tweets.length})\n`);
  console.log('  date        likes  reply    rt   quot   impr  er%  preview');
  console.log('  ' + '-'.repeat(78));

  let totals = { likes: 0, replies: 0, retweets: 0, quotes: 0, impressions: 0 };

  for (const t of tweets) {
    const m = t.public_metrics ?? {};
    totals.likes += m.like_count ?? 0;
    totals.replies += m.reply_count ?? 0;
    totals.retweets += m.retweet_count ?? 0;
    totals.quotes += m.quote_count ?? 0;
    totals.impressions += m.impression_count ?? 0;

    const engagement =
      (m.like_count ?? 0) +
      (m.reply_count ?? 0) * 13.5 + // replies weighted per user's spec
      (m.retweet_count ?? 0) * 2 +
      (m.quote_count ?? 0) * 2;
    const er = m.impression_count
      ? ((engagement / m.impression_count) * 100).toFixed(1)
      : '  -';

    const date = new Date(t.created_at).toISOString().slice(0, 10);
    const preview = t.text.replace(/\s+/g, ' ').slice(0, 40);
    console.log(
      `  ${date} ${fmt(m.like_count)} ${fmt(m.reply_count)} ${fmt(m.retweet_count)} ${fmt(m.quote_count)} ${fmt(m.impression_count)} ${String(er).padStart(4)}  ${preview}`
    );
  }

  console.log('\n  totals:');
  console.log(`    likes:       ${totals.likes}`);
  console.log(`    replies:     ${totals.replies}  (weighted x13.5 = ${(totals.replies * 13.5).toFixed(0)})`);
  console.log(`    retweets:    ${totals.retweets}`);
  console.log(`    quotes:      ${totals.quotes}`);
  console.log(`    impressions: ${totals.impressions}`);

  const avgReplies = totals.replies / tweets.length;
  console.log(`\n  avg replies/post: ${avgReplies.toFixed(2)}  ← optimize this, it's the 13.5x metric`);
}

main().catch((err) => {
  console.error(`stats.js failed: ${err.message}`);
  process.exitCode = 1;
});
