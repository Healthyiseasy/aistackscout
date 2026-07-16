# AIStackScout — Content Psychology Framework

## Reader Profile
Owner or CEO of a business with 1–100 employees.
Skeptical. Has been burned by overhyped software before.
Time-poor. Decides fast and moves on.
Does not want to be sold to. Wants to be advised by a peer.
Responds to loss framing, peer benchmarking, and ROI specificity.
Ignores feature lists. Cares only about outcomes.

## Core Principles — Apply To Every Article

### 1. Loss Aversion Over Gain Framing
Lead with what they are losing by not acting.
Never: "This tool helps you grow."
Always: "Your competitors are already using this."

### 2. Peer-Specific Social Proof
Never: "Thousands of businesses use this."
Always: "Teams like yours — 10 to 50 people — are replacing
three tools with this one."

### 3. Authority Through Honesty
State what the tool does, what it costs, what it delivers,
and where it falls short. Admitting weaknesses builds more
trust than hiding them. Never use promotional language.

### 4. Price Anchoring
Always establish a cost anchor before revealing tool price.
Example: "A full-time content writer costs $50K per year.
Jasper at $49/month replaces 60% of that output."

### 5. The So What Filter
Every claim must answer: what does this mean for my business?
Bad: "Jasper uses advanced AI to generate content."
Good: "Jasper cuts content production time by 70% —
your marketing manager gets half their week back."

### 6. Commitment Before The Ask
Get the reader nodding yes to small points early before
recommending a paid tool. By the time they hit the CTA
they are already committed to the logic.

### 7. Scarcity — Only When Real
CEOs see through fake urgency immediately. Never manufacture it.
Only use when real — limited pricing, deadlines, deprecations.

### 8. Max 4 Tools Per Article
Always give a clear winner. Never hedge.
Comparison closer rotation: pick from the closer pool in the Article Pattern Break Rule below. Never repeat the previous article's closer. "Bottom line: if you pick one, pick X" is allowed but not mandatory; pattern-break audit governs each article.

### 9. Pain-First Structure
Every article: Pain → Cost of inaction → Criteria → Solution → Verdict

---

## Article Structure

These are internal **stages**, not output headings. Never print the stage names (Hook, Bottom Line Up Front, Criteria, Reviews, Clear Winner, CTA) as literal H2/H3 text — see `.claude/rules/article-writer.md`. Hook + BLUF run as opening prose with no heading; body sections get descriptive, pain-specific headings; each tool's heading is its own name.

- Headline: outcome or loss — never lead with the tool name
- Hook: 2 sentences — state the pain, make them feel understood (no heading)
- Bottom Line Up Front: conclusion before the argument (no heading)
- Criteria: what to look for before buying in this category (descriptive H2)
- Reviews: max 4 tools, real pricing, one honest weakness each (tool name is the heading)
- Clear Winner: always pick one (descriptive H2)
- CTA: one action, one link, no options (no heading)

---

## Language Rules

NEVER USE: amazing, powerful, game-changing, revolutionary,
cutting-edge, robust, seamless, leverage, unlock, supercharge,
delve, navigating the landscape.

ALWAYS USE: specific numbers, real pricing, time saved,
dollars saved, headcount impact, honest weaknesses.

Tone: trusted peer advisor. Direct. No fluff.
Reader: 1 to 100 person business owner who reads fast.

---

## Affiliate Conversion Rule

The link must feel like the natural next step after an
honest verdict — not a pitch. Never place affiliate links
before establishing trust. Always disclose — it builds
credibility with skeptical owners, not suspicion.

## Email & Newsletter Psychology

### Subject Lines
- Curiosity gaps: promise benefit, withhold specifics
- Use numbers: "3 tools" beats "some tools"
- Loss aversion: "You're losing 5hrs/week" beats "Save 5hrs/week"
- Under 50 characters — mobile truncates after that
- Never ALL CAPS or multiple exclamation marks (spam trigger)

### Click Psychology (Articles + Emails)
- One primary CTA per piece — never dilute with competing links
- "Give give give ask" pattern: 3 value points before 1 affiliate link
- Frame as a reasoned pick, NOT a personal test: "the better fit for a team your size" — never fabricate first-hand testing ("I tested this", "in our testing"). Ground claims in the tool's documentation and public user reports. FTC: unsubstantiated first-hand claims are a compliance risk (see `.claude/rules/article-writer.md`).
- Specific outcomes: "saves 5 hours/week" not "improves productivity"
- Anchor high then reveal: "Consultants charge $300/hr for this. This tool does it for $49/mo."
- Reply/engagement prompt at the end of every email

### Conversion Triggers (Universal)
- Social proof every piece: "A CEO I work with..." or "3 clients switched to..."
- Scarcity only when real — never fake urgency
- Reciprocity: genuine value first, recommendation second
- Identity framing: "Smart operators already use this" — reader wants to be in that group

### Newsletter Structure
1. Hook — one sentence, curiosity or loss aversion
2. Signal — main insight or tool review
3. Proof — real-world result or CEO insight
4. Recommendation — one affiliate link as personal pick
5. P.S. — forward request or reply prompt

### Email Hard Rules
- Max 2 affiliate links per email
- Every link preceded by genuine value
- Always disclose affiliate relationship
- Send Tuesday or Thursday 7-9am Mountain
- Never buy email lists
- Never exceed 2x/week

---

## Twitter Rules

See `x-autoposter/rules/twitter-rules.md` (locked April 30, 2026). All Twitter content rules — voice, formats, banned openers, link placement, shadowban prevention — live there as the single source of truth. This file (psychology.md) covers universal influence principles only.

---

## Article Pattern Break Rule

### ARTICLE TEMPLATE PATTERN BREAK (PERMANENT)

Never repeat the same audience descriptor or closing phrase across consecutive articles. AI-template signatures destroy CEO trust faster than any other writing flaw.

### Banned Repetitions
- "businesses with 10 to 100 employees" (used in last 3 articles — retire indefinitely)
- "small to medium businesses"
- "SMBs of all sizes"
- Any size-range descriptor used in 2+ of the last 3 published articles
- Any closing phrase identical or near-identical to the previous article

### Pre-Write Audit (REQUIRED)
Before drafting any new article, fetch the last 3 published article excerpts and intros from WordPress. Identify:
1. Audience descriptor used in each
2. Closing phrase used in each
3. Opening pain hook structure used in each

If the new article would repeat any of these, change it.

### Rotation Pool for Audience Descriptors
- "for lean teams that can't add headcount"
- "for founders still doing too much ops work"
- "tested by SMB owners this month"
- "for teams of 5 to 50 doing the work of 150"
- "for the messy middle — post-MVP, pre-Series A"
- "no enterprise pricing, no enterprise bloat"
- "for businesses outgrowing spreadsheets"
- DROP THE DESCRIPTOR ENTIRELY (alternate articles do this)

### Rotation Pool for Closing Lines
- "Here are the 4 that actually deliver."
- "Here are the 4 worth your time."
- "Here is what we tested and what won."
- "Below: real pricing, honest weaknesses, clear winner."
- "We picked these 4 because they pay back fast."
- DROP CLOSER ENTIRELY — let the H2 do the work

### Rotation Pool for Opening Pain Hooks
- Direct stat with timeframe ("23 hours per open role")
- Comparison to competitor ("Your competitors hire in 2 weeks while...")
- Concrete failure scenario ("Your team sends invoices late, follows up inconsistently...")
- Time-cost frame ("You spend 10 hours/week on X")
- Money-leak frame ("$15K/year in lost executive time")

### Enforcement
Apply to every article going forward. Apply to homepage excerpts, not just article body. Apply to meta descriptions where they appear in cards.
