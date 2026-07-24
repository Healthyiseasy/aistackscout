# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

AIStackScout is an editorial content project — not a software codebase. It produces comparison articles reviewing AI tools for small-business decision-makers (1–100 employees). The project connects to a WordPress backend at aistackscout.com via MCP.

## MCP Integration

The `.mcp.json` config connects to the AIStackScout WordPress site (`/wp-json/mcp/v1/http`). Use MCP tools to read, create, and publish content on the site.

## Editorial Voice & Psychology

The full spec lives in `.cursor/rules/aistackscout-content-psychology.mdc`. Key rules:

- **Reader:** CEO/owner, 1–100 employees. Skeptical, time-poor, burned by hype.
- **Structure:** Pain-first → BLUF (verdict upfront) → criteria → reviews (max 4 tools) → one clear winner → single CTA with affiliate disclosure.
- **Loss framing over gain:** Lead with cost of inaction, not "helps you grow."
- **Every claim must pass the so-what filter:** tie to time, dollars, or headcount.
- **Honesty as authority:** Real pricing, one genuine weakness per tool, no promotional tone.
- **Price anchor:** Compare tool cost against an FTE or existing spend before showing the price.
- **Comparison closer:** rotate across the psychology.md closer pool. Never use the same phrase as the previous article. "Bottom line: if you pick one, pick X" is allowed but not mandatory; pattern-break audit governs each article.
- **Banned words:** amazing, powerful, game-changing, revolutionary, cutting-edge, robust, seamless, leverage, unlock, supercharge, delve, navigating the landscape.
- **Tone:** Trusted peer. Direct, no fluff.

## Content Generation — Proof Format Rotation

**Rewritten 2026-07-21. The peer-story opener is now retired in EVERY channel.** The Twitter ban (agent v3 lock) was correct and is extended here to articles, newsletters, and LinkedIn. The previous carve-out allowed "max 1 peer-story opener per article and per newsletter issue" — a full-content audit of all 62 published posts found that carve-out had produced fabricated client anecdotes in five live articles (#1100, #1150, #1220, #1231, #1272) and was a direct contributor to the affiliate rejection. An unverifiable testimonial is an FTC violation at any frequency, so a per-article cap does not fix it. Across 62 articles, "max 1 each" is precisely how five got published.

All content generation tasks (Twitter, newsletters, articles, LinkedIn) must follow **RULE ZERO — NO FIRST-PERSON EXPERIENCE CLAIMS** in `.claude/rules/psychology.md`, which overrides every persuasion technique in that file.

**Openers must be research-based.** Rotate across these 4 formats:

1. **Numbers-first stat** — directional, or cited to a real named source. Never invent a study.
2. **Contrarian observation** — pure point of view, no story.
3. **Pattern call-out** — sourced and plural: "Reviews of this category repeatedly flag...", never "Three founders asked me this month."
4. **Challenge/question hook** — a sharp question, no story.

**Banned in every channel:** any `[role] I [verb]` construction, "we tested / we compared / we vet", invented client outcomes, and citations to McKinsey/HubSpot/Gartner/Forrester/Litmus/Wyzowl-style sources that are not named in the brief. Approved proof framings: "users report", "according to [vendor]'s documentation", "based on verified reviews on [named site]".

**Agent files enforce this too** — see `.claude/agents/article-writer.md` and `.claude/agents/newsletter-builder.md`. Those are the files the pipeline actually loads; a rule change here without a matching change there has no effect.

## Content Generation — Article Pattern Break

Before drafting any article, follow the **Article Pattern Break Rule** in `.claude/rules/psychology.md`. Fetch the last 3 published articles and audit audience descriptors, closing phrases, and opening pain hooks. Never repeat any across consecutive articles. "businesses with 10 to 100 employees" is retired indefinitely. Rotate from the descriptor, closer, and hook pools — or drop them entirely on alternating articles. Applies to article body, excerpts, and meta descriptions.

## Article Template

`templates/article.md` is the scaffold for every article. The stages below are **internal scaffolding** — they describe what each section must accomplish. They are **NOT** literal headings:

1. Headline (outcome or loss — never lead with tool name)
2. Hook (2 sentences: pain + empathy) — **no heading; opening prose**
3. Bottom line up front (verdict before the argument) — **no heading; continues the opening prose**
4. What this is costing you (loss framing) — **a descriptive, pain-specific H2, not this label**
5. What to look for before you buy (criteria) — **a descriptive H2, not this label**
6. Reviews (max 4 tools, real pricing + honest weakness) — **each tool's H3 is the tool name, not "Reviews"**
7. Clear winner (named, no hedging) — **a descriptive verdict H2, not "Clear winner"**
8. Next step (one action, one link, disclosure) — **no heading; closing prose**

### NO SCAFFOLDING LABELS IN OUTPUT (hard rule)

Never emit the stage names above (Hook, Bottom line up front, What this is costing you, Criteria, Reviews, Clear winner, Next step, Tool A/B/C/D) as literal `H2`/`H3` headings in published `post_content`. They were leaking into live posts as headings — that is a hard reject. Full rule and the descriptive-heading guidance live in `.claude/rules/article-writer.md`; it is enforced as pre-publish blocker 9 in `.claude/rules/pre-publish-blockers.md`.

## Article Length

Article soft target is 2,000 words. Hard cap is 2,200. Never exceed 2,200. If an editorial change pushes the article over 2,200, trim in ONE pass before pushing to WP — never multiple rounds. Target 2,000 to leave a 200-word buffer for post-draft edits.

## Pre-Publish Blockers — REJECT publish if any are missing

Canonical version with verification commands lives in `.claude/rules/pre-publish-blockers.md`. Quick reference:

- **Rank Math meta description** present, 155–165 chars, contains focus keyword
- **Page H1 verified** via `curl | grep '<h1'` — exactly one `<h1 class="entry-title">` containing the post title (the theme provides this; do NOT add a second H1 in `post_content`)
- **Inline (aff) marker** on every affiliate anchor link (in addition to the top-of-post block disclosure)
- **Featured image alt text** present and descriptive
- **At least 2 internal links** to existing published articles, written as absolute URLs
- **All /go/ links** use absolute URLs (`https://aistackscout.com/go/<slug>`), never relative
- **Every /go/ slug** exists in Pretty Links and resolves to a non-empty target — verify via Pretty Links admin or DB read; **never** test-click an affiliate link

Note: the original audit spec said "150–160 chars" and "in-body H1 present." Both were corrected during the 2026-04-26 remediation (`audits/audit-script-bugs.md` documents why). The corrected rules above are the ones to enforce.
