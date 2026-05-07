#!/usr/bin/env node
import 'dotenv/config';
import { makeClient } from './lib/twitter.js';

async function main() {
  const client = makeClient();

  const marker = Math.random().toString(36).slice(2, 8);
  const text = `api health check ${marker} — retrieval test, safe to ignore.`;

  console.log(`posting test: "${text}"`);
  const res = await client.v2.tweet(text);
  const tweetId = res.data?.id;
  if (!tweetId) throw new Error(`tweet call returned no id: ${JSON.stringify(res)}`);
  console.log(`posted. tweet_id=${tweetId}`);

  // Small delay before lookup — X's read path can lag a second or two.
  await new Promise((r) => setTimeout(r, 1500));

  const lookup = await client.v2.singleTweet(tweetId, {
    'tweet.fields': ['created_at', 'text', 'public_metrics', 'possibly_sensitive'],
  });

  if (!lookup.data) {
    console.error('FAIL: tweet is not retrievable via API immediately after posting.');
    console.error('this is a strong signal of a read restriction — investigate account status.');
    process.exit(2);
  }

  console.log('retrieved via v2.singleTweet:');
  console.log(JSON.stringify(lookup.data, null, 2));

  // Secondary sanity: can we find it in our own timeline?
  try {
    const me = await client.v2.me();
    const timeline = await client.v2.userTimeline(me.data.id, {
      max_results: 5,
      'tweet.fields': ['created_at'],
    });
    const inTimeline = timeline.data?.data?.some((t) => t.id === tweetId);
    console.log(`appears in own timeline: ${inTimeline ? 'yes' : 'no'}`);
    if (!inTimeline) {
      console.warn(
        'warning: tweet did not appear in the first page of your own timeline. ' +
          'could be timing lag — re-run in a minute. if it persists, investigate.'
      );
    }
  } catch (err) {
    console.warn(`timeline check skipped: ${err.message}`);
  }

  console.log(`\ndone. manual cleanup: the test tweet ${tweetId} is still live on your account.`);
  console.log('delete it from the X app or via: client.v2.deleteTweet(id) if you want.');
}

main().catch((err) => {
  console.error(`check-shadowban.js failed: ${err.message}`);
  process.exitCode = 1;
});
