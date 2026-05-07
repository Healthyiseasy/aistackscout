import { TwitterApi } from 'twitter-api-v2';

export function makeClient() {
  const {
    TWITTER_API_KEY,
    TWITTER_API_SECRET,
    TWITTER_ACCESS_TOKEN,
    TWITTER_ACCESS_SECRET,
  } = process.env;

  const missing = [
    ['TWITTER_API_KEY', TWITTER_API_KEY],
    ['TWITTER_API_SECRET', TWITTER_API_SECRET],
    ['TWITTER_ACCESS_TOKEN', TWITTER_ACCESS_TOKEN],
    ['TWITTER_ACCESS_SECRET', TWITTER_ACCESS_SECRET],
  ].filter(([, v]) => !v).map(([k]) => k);

  if (missing.length) {
    throw new Error(
      `Missing Twitter credentials in .env: ${missing.join(', ')}`
    );
  }

  return new TwitterApi({
    appKey: TWITTER_API_KEY,
    appSecret: TWITTER_API_SECRET,
    accessToken: TWITTER_ACCESS_TOKEN,
    accessSecret: TWITTER_ACCESS_SECRET,
  });
}
