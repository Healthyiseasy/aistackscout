# AIStackScout — Affiliate Compliance Rules

## Apply these rules to every article, every time, no exceptions.

## RULE 0 — /go/ Pretty Links Are Conditional On Approval

**A `/go/<slug>` Pretty Link may only be created and used for a tool that appears in `.claude/rules/approved-affiliates.md` as an APPROVED program.**

For tools without an approved affiliate program:
- Link directly to the tool's homepage (no `/go/` wrapper)
- Do NOT create a Pretty Link
- Do NOT add the inline `(aff)` marker
- Do NOT include affiliate disclosure language for that tool

When drafting any article:
1. Check `.claude/rules/approved-affiliates.md` against every tool you plan to feature. If the master list isn't sufficient or you're unsure, ask the user which tools have approved affiliate programs before drafting.
2. For approved tools: use `/go/<slug>` Pretty Link + `(aff)` marker + standard disclosure.
3. For non-approved tools: direct homepage link only. Treat the tool exactly like a non-affiliated reference.
4. The single article CTA must point to an approved tool. If none of the featured tools are approved, replace the tool CTA with an internal action (newsletter, related article). The FTC disclosure block remains ON regardless — `_suppress_ftc_disclosure` must equal `0` on every post, no exceptions.

The master list at `.claude/rules/approved-affiliates.md` is the single source of truth. Currently empty (no approved programs yet) — assume zero affiliate links until the list is populated.

## DO — Every Article Must Have
- FTC disclosure at the very top of every post (handled by Code Snippets hook automatically) — ON site-wide for every post, with or without affiliate links. `_suppress_ftc_disclosure` must always equal `0`. No post ever suppresses.
- Affiliate Disclosure page linked in footer — /affiliate-disclosure/
- Affiliate links cloaked through Pretty Links — never raw affiliate URLs (and only for approved tools per Rule 0)
- One honest weakness per tool reviewed — never all positive
- Clear winner stated — never hedge with "it depends"
- Single CTA at the end — one link, one action, affiliate disclosure noted (CTA target must be an approved tool, or an internal action if none qualify)
- Internal links to 2–3 existing articles
- Real 2026 pricing — never vague or outdated
- Rank Math focus keyword set before publishing
- Content published at minimum 1,500 words

## DO NOT — Never Do These
- Never click affiliate links to test them — instant program ban
- Never fabricate reviews for tools not researched
- Never use brand trademark names in URLs or ad campaigns
- Never rank tools based on highest commission — rank on best fit for reader
- Never hide disclosure or put it only in footer
- Never promise specific earnings to readers
- Never use cookie stuffing, redirect tricks, or fake traffic
- Never let affiliate c
