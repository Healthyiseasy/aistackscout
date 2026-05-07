# AIStackScout Twitter / X Shadowban Prevention Rules

**Locked: April 30, 2026**
**Authority: This file overrides any conflicting AI-generated suggestions.**

These rules combine three sources:
1. Self-built rules (from x-autoposter scripts and README, April 14-24, 2026)
2. Educator Playbook (from AIStackScout_Twitter_Educator_Playbook.pdf)
3. Verified web research (April 30, 2026)

---

## SECTION 1 — Self-Built Operational Rules (LOCKED)

### Rate limits (hardcoded in post.js, never modify without approval)
- MAX_POSTS_PER_DAY = 3
- MIN_SPACING_MS = 2 hours between posts
- LONG_FORM_MAX = 2000 chars
- SHORT_MAX = 280 chars

### Posting schedule (hardcoded in generate-drafts.js SLOTS)
- 7:00 AM Mountain Time
- 11:00 AM Mountain Time
- 2:00 PM Mountain Time

### Content composition
- 80% value content, 20% promotional
- Topic-rotated across 6 pillars (no consecutive duplicate topics)
- Every post ends with engagement question (drives 13.5x reply weight)
- Anti-repetition: 7-day history check across all posts

### Engagement automation (PERMANENTLY BANNED)
- No auto-likes
- No auto-follows
- No auto-replies
- No auto-retweets
- No mass following or unfollowing
- Shadowban triggers if any of these are added

### FTC compliance
- Auto-append #ad to any draft flagged has_affiliate: true
- Affiliate disclosure live in profile bio
- Pretty Link format only: aistackscout.com/go/[slug]

### Review workflow
- All drafts written to drafts/ folder first
- Manual review required before scheduler picks up
- No unreviewed posts go live

### Shadowban detection
- Run check-shadowban.js weekly minimum
- Run immediately if engagement drops more than 50% week-over-week

---

## SECTION 2 — Educator Voice Rules (NEW, April 30, 2026)

### The strategic pivot
Voice = friendly peer expert educating about tools. NOT practitioner sharing war stories.

### Banned openers (PERMANENT)
- "An exec I drove..."
- "A CEO I know..."
- "Someone I work with..."
- "A founder I talked to..."
- "Helped a [number]-person team..."
- Any "[role] I [verb]..." pattern
- "I spent [time] setting up [tool]..."

### The 5 educator formats (rotate, never repeat 2 in a row)
1. **Tool Breakdown** — what tool does well/badly + who it's for
2. **Category Map** — 3-5 tools mapped to use cases
3. **Mistake Pattern** — plural mistakes, CAP: 1 per week max
4. **Stat-Led Insight** — directional stat + insight
5. **Decision Question** — sharp question + clean answer

### Banned phrases
- "10 to 100 employees"
- Any repeated audience descriptor across consecutive posts
- "saves time" (no specificity)
- Vague claims without numbers, named tools, or concrete outcomes

### Voice ratio
- "You" used 3x more than "I"
- Specificity beats cleverness
- Hook must answer "why care?" in first 12 words

---

## SECTION 3 — AI-Cadence Detection (BANNED markers)

These read as AI-generated and erode credibility:

- Em-dashes (—) used as primary punctuation
- "delve" / "delving"
- "leverage" / "leveraging"
- "in today's fast-paced..."
- "it's important to note..."
- "navigating the landscape of..."
- Balanced "not just X but Y" constructions repeated
- "+" sign used in marketing copy (use "plus")

Read every tweet aloud before posting. AI cadence is detectable within 3-5 tweets.

---

## SECTION 4 — Algorithm Engagement Weights (X 2026)

Based on X's open-sourced ranking code:

| Action | Weight |
|---|---|
| Reply with author back-reply | 150x a like |
| Retweet / Repost | 20x |
| Reply (no back-reply) | 13.5x |
| Profile click | 12x |
| Link click | 11x |
| Bookmark | 10x |
| Like | 1x baseline |

**Implication:** First-hour author back-replies are the highest-leverage action available. Block 60-90 minutes after every post for replies.

---

## SECTION 5 — External Link Rules (CRITICAL)

### Confirmed shadowban triggers
- External link spam: posting same link repeatedly
- External links in main thread tweets (severe suppression on non-Premium)
- Walls of hashtags (max 0-2 per post)
- Identical replies across multiple threads

### Link placement (MANDATORY)
- Threads: NEVER put link in main tweet. Link goes in REPLY to final tweet.
- Single posts: link permitted only if rest of post earns engagement on own merit
- Multiple links: split into SEPARATE replies, 2-3 minutes apart, with context
- Never stack 3+ raw links in one reply

### Reply timing
- Wait 5-10 minutes after thread completes before first link reply
- Space subsequent link replies 2-3 minutes apart
- Brand-new accounts under 30 days old: extend all spacing by 50%

---

## SECTION 6 — Reply Game Rules

### Reply quality
- 1-2 sentences minimum
- Specific to the tweet replied to
- Never generic ("great post!", "this!", "100%") — these trigger reply deboosting

### Reply targets
- Accounts in 10K-50K follower range
- Niche: AI tools, SMB, executive, productivity
- Skip 100K+ accounts (replies get buried)
- 10-20 thoughtful replies per day

### Author back-replies
- First 60-90 minutes after posting = critical window
- Reply to first 10-20 comments
- 150x a like in algorithm weight
- Single highest-leverage time investment available

---

## SECTION 7 — Account Health Rules

### Premium subscription
- Recommended: Premium account = 2-4x reach boost
- Without Premium: external link suppression is severe
- ROI threshold: enable when affiliate revenue exceeds $200/mo

### Profile completeness (required before scaling activity)
- Real display name + username
- Clear bio stating what account does (no keyword stuffing)
- Profile photo + banner uploaded
- Pinned post with affiliate disclosure

### New account precautions (under 30 days)
- Reduce all activity by 50%
- Max 2 posts/day for first 30 days
- No threads in week 1
- Build to 3/day cadence by day 30

### If shadowban suspected
- Run check-shadowban.js immediately
- If confirmed: pause activity for 48-72 hours
- Delete any repetitive or link-heavy recent posts
- Resume with original, conversation-driving content only

---

## SECTION 8 — Pre-Publish Checklist

Run before every batch ships. If any answer is no, fix before posting.

- [ ] Format rotation: not same as last 2 posts
- [ ] Mistake Pattern format used 1x or fewer in last 7 days
- [ ] Zero banned openers
- [ ] Zero banned phrases
- [ ] Hook answers "why care?" in first 12 words
- [ ] Every claim has a number, named tool, or concrete outcome
- [ ] "You" used 3x more than "I"
- [ ] Bookmark line present in threads
- [ ] No external link in main thread tweet
- [ ] Pretty Link format aistackscout.com/go/[slug]
- [ ] Read aloud — no AI cadence
- [ ] Each tweet under 280 chars (or 2000 for long-form)
- [ ] Reply plan blocked: 60-90 min after posting
- [ ] FTC #ad on affiliate-flagged posts

---

## SECTION 9 — Update Protocol

This file is permanent and version-controlled.

- Updates require Mr. Rubio explicit approval
- Date every update at top
- Never delete sections, only revise
- Keep prior versions in .claude/rules/archive/ if rewriting
- Scripts (generate-drafts.js, post.js, scheduler.js) read from this file — changes here flow downstream
