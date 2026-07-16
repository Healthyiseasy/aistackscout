# Affiliate-Readiness Fixes — Edit Log (2026-07-15)

Applied from the affiliate-approval readiness audit. All WordPress changes via the aistackscout MCP (read-only elsewhere). No posts/drafts published, deleted, or restored. Pre-fix git checkpoint: `456c4f0`.

---

## 1. Rule / config files (local repo)

- **Created `.claude/rules/article-writer.md`** — home of the hard "NO SCAFFOLDING LABELS IN OUTPUT" rule + "no fabricated first-hand testing (FTC)" rule. (The prior note referenced this file, but it did not exist — now created.)
- **`templates/article.md`** — converted literal `## Hook`, `## Bottom line up front`, `## What this is costing you`, `## What to look for…`, `## Reviews`, `## Clear winner`, `## Next step` into internal STAGE comments with instructions to emit descriptive headings instead.
- **`CLAUDE.md`** — Article Template section: stages marked as internal scaffolding, added the NO-SCAFFOLDING-LABELS hard rule + pointer to article-writer.md.
- **`.claude/rules/psychology.md`** — Article Structure marked stages-not-headings; **fixed the FTC root cause**: the line instructing `Frame as personal recommendation: "I tested this"` → reasoned-pick language, never fabricate first-hand testing.
- **`.claude/rules/pre-publish-blockers.md`** — added Blocker 9 (no scaffold-label headings, no fabricated first-hand testing, with verify commands).
- **Root `psychology.md`** (was 0 bytes) — converted to a pointer to `.claude/rules/psychology.md`.
- **Created `verified-pricing.md`** — dated source-of-truth for the 8 tools in drafts #1254 (PandaDoc, Qwilr, Proposify, Better Proposals) and #1255 (Gamma, Plus AI, Beautiful.ai, Decktopus). Every entry marked `STALE — VERIFY` with vendor pricing URL (no pricing independently confirmed this pass).

## 2. Author archive slug (WordPress user #1)

- `user_nicename`: `mr-rubio2727gmail-com` → **`kr-rubio`** via wp_update_user.
- Verified (cache-buster bypassing LiteSpeed): `https://aistackscout.com/author/kr-rubio/` → 200 "K.R. Rubio"; old `/author/mr-rubio2727gmail-com/` → 404. Schema author @id now resolves to `/author/kr-rubio/`.
- NOT done via MCP: 301 redirect from the old slug (Rank Math redirections live in a custom DB table the MCP cannot write) — see NEEDS-OWNER.

## 3. Dead affiliate link (site-wide /go/ scan: 73/74 resolved)

- **Post 986** — `/go/scribe` returned 404 (only dead link found site-wide; used in 2 anchors). Repointed both to the live homepage `https://scribe.com/` (Scribe is not an approved affiliate, so per Rule 0 a direct homepage link is correct). Verified: 0 `/go/scribe`, 2 `https://scribe.com/` links, target resolves 200.

## 4. First-person testing-claim rewrites

Rewrote fabricated/unsubstantiated first-hand testing language to non-first-hand phrasing (comparison / documentation / user-report framing), removing invented metrics and methodology. Surfaces: post_content, post_excerpt, post_title, and Rank Math meta description.

### Body (post_content)
- **608** jasper-ai-review-2026 — title "…We Used It for 30 Days —…" → removed; whole fabricated "What We Tested and How" 30-day protocol → "How This Review Assesses Jasper" (task categories, no invented counts); "In our testing, Brand Voice reduced editing time by 40%…" → capability framing; "Of the 8 blog posts we generated, 6 needed… 75% hit rate… Copy.ai (50%)/Writesonic (40%)" → documentation/user-report framing; "In our testing, a product launch sequence…45 minutes/90 minutes" → capability; "We handed Jasper to a sales rep and an ops manager…" → typical-pattern framing; "In our 30-day test, roughly 15%…" → "In practice, a meaningful share…"; excerpt "We tested Jasper AI for 30 days…" → "This Jasper AI review is built for SMB workflows."
- **609** jasper-vs-writesonic-2026 — BLUF "We ran both tools…for 30 days" → "We compare both…"; "(For the full 30-day breakdown…" → "(For the full breakdown…"; "Roughly 15% of factual claims in our testing…" + "our ops manager gave up after 20 minutes" → general framing; "In our testing, Writesonic blog posts needed 40 to 60% more editing… 20% vs Jasper's 15%" → general; **entire "Head-to-Head: The Test Results"** section (fabricated per-task counts/times) → "Head-to-Head: How They Compare" (qualitative, positioning-based).
- **610** — "In our testing, AI-personalized emails from Apollo achieved 23% higher open rates and 35% higher reply rates…" → "Apollo's AI-personalized emails are built to lift open and reply rates…"
- **612** — "In our testing, accuracy ranged from 92%…to 78%…" → "Reported transcription accuracy typically ranges from around 92%…to about 78%…"
- **732** — "we tested all four on real campaigns" → "we compared all four across real campaign use cases"
- **735** — "we tested all four on real SMB financials" → "we compared all four across real SMB financial workflows"
- **986** — "the smoothest of the four tools tested here" → "…tools compared here"
- **1007** — "Here is what we tested and what won." → "…we compared and what won."
- **1044** best-ai-voice-generation — "Every CEO…we've talked to this quarter…" → "Most 10-to-50-person companies…"; heading "…the one we'd test first" → "…the one to test first"; "We tested a 400-word product description on the Eleven Multilingual v2 model. It paused…None of the others nailed all of that." → capability framing; "three AI voice generation tools tested on real SMB workflows" → "…compared for real SMB workflows"; "the same testing framework" → "the same evaluation framework"
- **1093** — "The 4 AI meeting assistant tools we tested" → "…we compared"; "Fathom is what we tested and what won." → "Fathom is our pick, and the reasoning is below."
- **1100** — "We tested four AI churn prediction tools on real subscription businesses." → "We compared four…for real subscription businesses."
- **1111** — "We tested four AI sales coaching tools on real revenue teams." → "We compared four…for real revenue teams."
- **1130** — "We tested four AI scheduling tools on real executive calendars." → "We compared four…for real executive-calendar needs."
- **1197** — "We put the three models Apple just placed on equal footing through that exact test." → "We compare the three models…on exactly that question."
- **1257** — "The four we tested" → "The four we compared"
- **1261** — "The four we tested" → "The four we compared"
- **607** — "four AI writing tools tested on real SMB workflows" → "four AI writing tools compared for real SMB workflows"

### Excerpts (post_excerpt)
608, 609, 1009, 1044, 1093, 1111, 1130, 1133, 1160, 1261 — "we tested/tools tested/we ran…for 30 days" → "compare/compared" variants; **1257** — "which one we'd buy" → "which one we'd pick".

### Rank Math meta descriptions (rank_math_description) — 20 posts
608, 609, 732, 734, 735, 841, 862, 900, 925, 963, 996, 1009, 1044, 1074, 1100, 1111, 1130, 1133, 1160, 1266 — "We tested / N tools tested / 30 days of real testing" → "We compare / N tools compared" variants. All verified: 0 remaining claims, all 120–165 chars.

### Verification
Fresh cache-busted refetch of all 60 posts: none of the old claim strings remain; new strings present; price bug ($125/month) fixed on 608. Broad first-person straggler scan came back clean (remaining "our sales rep" hits were substrings of "your sales reps").

---

## NOT done via MCP (tooling limits) — see report
- WordPress generator version tag (`<meta name="generator" content="WordPress 7.0.1">`) — no MCP-exposed option; needs functions.php/mu-plugin/Code-Snippet (Code Snippets stores in a custom table the MCP can't write).
- 301 redirect old author slug → new — Rank Math redirection table not MCP-writable.
- Byline link target (→ homepage instead of author page) — Kadence theme setting, not MCP-editable.

## Corrected audit finding
- **Logo (audit item 6) was a FALSE POSITIVE.** The grey SVG is a LiteSpeed lazy-load placeholder; the real logo (`cropped-preview.webp`, alt "AIStackScout" — a clean wordmark) is set as `custom_logo` and renders for real users. No change made.
