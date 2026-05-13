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

All content generation tasks (Twitter, newsletters, articles, LinkedIn) must follow the **Proof Format Rotation Rule** in `.claude/rules/psychology.md`. Key constraints: Twitter — peer-story openers are permanently banned. Not allowed even 1x per week. Educator voice only. Articles and newsletter issues — max 1 peer-story opener ("A CEO I know...", "An exec I drove...") per article and per newsletter issue. Audit the last 7 days before generating any batch. Rotate across 5 proof formats: peer story, numbers-first stat, contrarian observation, pattern call-out, challenge/question hook.

## Content Generation — Article Pattern Break

Before drafting any article, follow the **Article Pattern Break Rule** in `.claude/rules/psychology.md`. Fetch the last 3 published articles and audit audience descriptors, closing phrases, and opening pain hooks. Never repeat any across consecutive articles. "businesses with 10 to 100 employees" is retired indefinitely. Rotate from the descriptor, closer, and hook pools — or drop them entirely on alternating articles. Applies to article body, excerpts, and meta descriptions.

## Article Template

`templates/article.md` is the scaffold for every article. Follow it exactly:

1. Headline (outcome or loss — never lead with tool name)
2. Hook (2 sentences: pain + empathy)
3. Bottom line up front (verdict before the argument)
4. What this is costing you (loss framing with specifics)
5. What to look for before you buy (criteria linked to outcomes)
6. Reviews (max 4 tools, each with real pricing + honest weakness)
7. Clear winner (named, no hedging)
8. Next step (one action, one link, disclosure)

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
