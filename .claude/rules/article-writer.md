# Article Writer — Output Rules

Rules that govern the **rendered output** of every article, on top of the voice/structure spec in `psychology.md` and the scaffold in `templates/article.md`.

## HARD RULE — NO SCAFFOLDING LABELS IN OUTPUT

The stage names used in `templates/article.md` and `psychology.md` — **Hook, Bottom Line Up Front (BLUF), What this is costing you, What to look for before you buy / Criteria, Reviews, Clear Winner, Next step / CTA** — are **internal scaffolding stages**. They describe *what each section must accomplish*. They are **NOT** literal headings and must **never** appear verbatim as `H2`/`H3` text in published `post_content`.

These labels were leaking into live posts as literal `## Hook`, `## Bottom line up front`, `## Clear winner` headings. That is a hard reject.

### What to output instead

- **Hook + BLUF:** open the article as prose with **no heading at all**. The first thing the reader sees is the pain hook, then the verdict — not a heading that says "Hook."
- **Body sections** ("costing you", "criteria"): use a **descriptive, benefit/pain-specific H2** written for the reader — e.g. `## The 68 days that open role is bleeding you` — not the scaffold label `## What this is costing you`.
- **Tool reviews:** use the **tool name** as the heading (`### Jasper`), never `### Reviews` or `### Tool A`.
- **Winner:** a plain descriptive H2 such as `## The one to pick` is fine; the literal `## Clear winner` is not.
- **CTA:** ends the piece as prose/one action; no `## Next step` heading.

### Banned literal headings (reject before publish)

`Hook` · `Bottom line up front` · `BLUF` · `What this is costing you` · `What to look for before you buy` · `Criteria` · `Reviews` · `Tool A` / `Tool B` / `Tool C` / `Tool D` · `Clear winner` · `Next step`

## HARD RULE — NO FIRST-PERSON EXPERIENCE CLAIMS (FTC)

*Strengthened 2026-07-21 after a full-content audit of all 62 published posts found flagged claims in 48 of 64 documents — 11 at HIGH severity. The earlier, softer version of this rule was insufficient because `psychology.md` simultaneously sanctioned peer-story openers. Both files are now aligned; `psychology.md` → RULE ZERO is the canonical statement.*

This project has no testing lab, no client roster, and no editorial "we." Every claim must be defensible as research.

### 1. No testing claims — ever

Banned verbatim: `I tested` · `we tested` · `in our testing` · `we compared` · `we ran both` · `we vet` · `we pressure-test` · `side-by-side tests` · `here is what we found` · `our results` · `hands-on` · `we tried` · `field-tested` · `one tested pick` · `the tools we test` · `we used it for [N] days`.

Also banned: **time-based usage claims** of any kind — "after 30 days with X", "three weeks in", "by week two we saw".

### 2. No invented anecdotes — ever

Banned: `A CEO I know` · `A CEO I spoke with` · `A founder I worked with` · `A founder told me` · `An exec I drove` · `3 clients switched` · `Three founders asked me this month` · `leadership teams we have reviewed` · `most CEOs we talk to` · any `[role] I [verb]` construction.

**This applies even when the story is meant as illustrative or composite.** A reader cannot tell the difference, and neither can a regulator. The peer-story opener is retired permanently.

### 3. No invented citations — ever

Never attribute a statistic to a named organization (McKinsey, HubSpot, Gartner, Forrester, Litmus, Wyzowl, Nielsen, Harvard Business Review) unless the exact study is named in the article brief or in `verified-pricing.md`, and can be located.

**A fabricated citation is worse than no citation.** If the source cannot be confirmed: drop the statistic entirely, or write it unattributed with a hedge ("commonly cited figures put this near..."). Do **not** swap in a different invented number.

### 4. No unverified precision metrics — ever

Any accuracy rate, percentage, minute count, or head-to-head ranking that could only be produced by running the tools is banned unless it comes from a named public source or the vendor's own materials (attributed as such: "the vendor claims 98% accuracy").

Banned in spirit as well as letter: "98% accurate by week two", "usable 70% of the time versus 85%", "identified as AI 22 percent less often", "roughly 78 percent accurate on tier-2 SaaS".

### Write instead

| Instead of | Write |
|---|---|
| "We tested X and it..." | "According to X's documentation, it..." |
| "In our testing, accuracy was 98%" | "X states an accuracy rate of 98%" — or omit |
| "We compared all four" | "This comparison assesses all four on..." |
| "A CEO I know cut churn by a third" | "Operators in this category commonly report..." |
| "Users find it 90% accurate" | "User reviews on G2 and Capterra report..." |
| "Here is what we found" | "Here is how they compare" |

Approved framings: **"users report"** · **"according to [named vendor]'s documentation"** · **"based on verified reviews on [named site]"** · **"the vendor claims"** · **"public reporting indicates"**.

### Pricing language

Pricing comes from `verified-pricing.md` only — the article-writer sandbox has no live web access. Write "verified on [date]" **only** when that entry is actually stamped `VERIFIED`. Otherwise use "directional" or "confirm on the vendor's pricing page." Posts #1142 and #1497 model the correct hedging.

### The one first-person claim that IS allowed

The author's real background — an Aspen-based operator with years of executive transportation experience — is genuine and may appear in an author bio or disclosure block. It may **not** be converted into client anecdotes, quoted conversations, or attributed outcomes.

## Enforcement

Enforced as **blocker 9** (scaffolding labels) and **blocker 10** (experience claims) in `pre-publish-blockers.md`. Before flipping any post to `publish`, confirm zero scaffolding labels appear as headings and zero banned phrases from sections 1–4 above appear anywhere in the body, excerpt, or meta description.

Related: `templates/article.md`, `psychology.md`, `pre-publish-blockers.md`.
