# x-autoposter

A draft-first X/Twitter posting system for a founder who refuses to automate
engagement. You write drafts (or Claude writes them for your review), a
scheduler posts them at the right time, and a few small scripts watch the
account health. Nothing clicks "like," "follow," "reply," or "retweet" on your
behalf. Ever.

## What this does

- Generates 3 draft posts per day with Claude (`claude-sonnet-4-20250514`) —
  80% value, 20% promotional, topic-rotated, zero external links, each
  ending in an engagement question.
- Stores them as markdown files with frontmatter in `drafts/` so you can
  review and edit every post before it ships.
- Posts the next due draft on command (`post.js`) or on a 15-minute poll
  (`scheduler.js`), enforcing: max 3 posts/day, minimum 2h between posts,
  long-form cap of 2000 chars.
- Auto-appends `#ad` to any draft flagged `has_affiliate: true` for FTC
  compliance.
- Has a shadowban/health check and a stats pull for tracking engagement.

## What this does NOT do

- **No engagement automation.** No auto-likes, no auto-follows, no
  auto-replies, no auto-retweets. If you find yourself asking "can it just…",
  the answer is no.
- **No unreviewed posts.** Drafts are written to `drafts/` and you review
  them before the scheduler picks them up.

## Setup

```bash
# 1. Install
cd x-autoposter
npm install

# 2. Configure credentials
cp .env.example .env
# Open .env and fill in:
#   - TWITTER_API_KEY / TWITTER_API_SECRET (your app's consumer key/secret)
#   - TWITTER_ACCESS_TOKEN / TWITTER_ACCESS_SECRET (your user access tokens,
#     Read + Write permissions)
#   - ANTHROPIC_API_KEY (for generate-drafts.js only)

# 3. Sanity check: can we actually post and retrieve?
node check-shadowban.js
# This posts a harmless "api health check" tweet and verifies it's
# retrievable via the API. The test tweet is left live — delete it by hand
# if you want.
```

### Getting X API credentials

You need an X developer account with an app that has OAuth 1.0a enabled and
**Read + Write** user permissions. From the developer portal:

1. Create a project + app.
2. Under the app's "User authentication settings", enable OAuth 1.0a with
   Read + Write access.
3. Under "Keys and tokens", generate:
   - API Key / API Secret → `TWITTER_API_KEY` / `TWITTER_API_SECRET`
   - Access Token / Access Token Secret (for your own user) →
     `TWITTER_ACCESS_TOKEN` / `TWITTER_ACCESS_SECRET`
4. Free tier lets you post; long-form (>280 chars) requires a paid tier.

## Draft format

Each file in `drafts/` is markdown with YAML frontmatter:

```markdown
---
title: short internal label
scheduled_time: 2026-04-15T13:00:00.000Z
type: value            # "value" or "promotional"
has_affiliate: false   # true → "#ad" is auto-appended at post time
---

The post body goes here. No external links, ever. End with a direct
question that invites a real reply — replies are weighted about 13.5x a
like in the X algorithm, so replies are the whole game.

What has been your best-performing reply hook this month?
```

`scheduled_time` must be ISO 8601 (UTC recommended). `generate-drafts.js`
writes this field in UTC automatically.

## Daily workflow

```bash
# Every morning (or whenever), generate tomorrow's drafts:
npm run generate

# Open the files in drafts/ and edit to taste. Set has_affiliate: true on
# anything that pitches a partner product. Delete anything you don't like.

# Option A — manual posting: run post.js whenever a draft is due.
npm run post

# Option B — let the scheduler poll every 15 minutes:
npm run scheduler
# Leave it running in a terminal, tmux session, or under a process manager
# like launchd / pm2.
```

## Scripts

| command               | what it does                                                                 |
| --------------------- | ---------------------------------------------------------------------------- |
| `npm run generate`    | Claude writes 3 drafts for tomorrow (or today if before 7am MT) into `drafts/`. |
| `npm run post`        | Posts the next due draft (or a specific file: `node post.js drafts/foo.md`). |
| `npm run scheduler`   | Long-running 15-min poll loop; posts whatever is due.                         |
| `npm run shadowban`   | Posts a test tweet and verifies retrieval via the API.                       |
| `npm run stats`       | Pulls public metrics for your recent posts (replies weighted x13.5).         |

## Rate limits and safety rails

These are enforced in code, not just documented:

- **Max 3 posts per day.** `post.js` and `scheduler.js` check
  `post_log.json` and refuse if you're already at 3 today.
- **Minimum 2 hours between posts.** Even if you manually queue two
  back-to-back drafts, the second will be deferred.
- **Long-form cap: 2000 chars.** Anything longer is rejected, not
  truncated.
- **No URLs.** `generate-drafts.js` validates that Claude never emits
  `http://`, `https://`, or `www.` in a draft body.
- **Auto `#ad`.** When `has_affiliate: true`, the posting pipeline appends
  `#ad` to the text. Don't add it to the draft body yourself — the pipeline
  is idempotent and will skip re-tagging if `#ad` is already present.

## Logs and archival

- `post_log.json` — append-only record of every post. One JSON array on
  disk, rewritten atomically. Tracks tweet id, title, type, affiliate flag,
  length, source draft name, archive path, scheduled/posted timestamps.
- `posted/` — the original draft files are moved here after posting, with a
  timestamp and tweet id prefix so you can trace a tweet back to its
  source.

## Notes on the 13.5x reply weighting

The reply-to-like weight ratio in `stats.js` is the number the X algorithm
is rumored to use internally. Treat it as a directional signal, not a
physical law. The point of `generate-drafts.js` demanding an engagement
question in the tail of every post is that replies are the lever, and
replies require a reason to reply.

## Philosophy

Content automation is fine. Engagement automation gets accounts suspended,
erodes trust, and produces bad relationships. This tool is deliberately
content-only and deliberately human-in-the-loop.
