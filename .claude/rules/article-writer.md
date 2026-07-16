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

## No fabricated first-hand testing (FTC)

The site is published under a byline without a verifiable testing lab. Do **not** write first-person hands-on claims the project cannot substantiate — "I tested", "we tested", "in our testing", "we used it for 30 days", "we ran both". Write outcome and feature analysis grounded in the tool's own documentation and public user reports, and phrase recommendations as reasoned picks ("the better fit for a team your size"), not as personal test results. See `psychology.md` → Click Psychology.

## Enforcement

Add to the pre-publish pass (`pre-publish-blockers.md`, blocker 9). Before flipping any post to `publish`, confirm zero scaffolding labels appear as headings and zero unsubstantiated first-hand testing claims appear in the body.

Related: `templates/article.md`, `psychology.md`, `pre-publish-blockers.md`.
