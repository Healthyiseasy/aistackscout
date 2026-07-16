# Pre-Publish Blockers — MANDATORY

Before publishing ANY article, run through this checklist. Each item is a blocker. If any item fails, **do not publish** — fix it and re-check.

## Blockers

0. **Title length and structure (HARD REJECT).** `post_title` must be **≤ 60 characters** AND must read as **one complete thought**, not two stitched-together sentences. If the title exceeds 60 characters, or contains more than one sentence-ending punctuation mark (`.`, `!`, `?`) before the final character, the validator REJECTS the post before save. **Always show the proposed title to the user for approval before any `wp_create_post` call.**
1. **Rank Math meta description** present, 155–165 chars, contains the focus keyword once.
2. **In-body H1** strategy is correct for the active theme:
   - The theme renders `post_title` as the page `<h1 class="entry-title">`. Do **not** add a second H1 inside `post_content`.
   - Body content must start at H2.
   - Verify with `curl -s <url> | grep -oE '<h1[^>]*>[^<]*</h1>'` — the result must be exactly one H1, and it must contain the post title.
3. **Inline `(aff)` marker** on every affiliate anchor link in the body. (The top-of-post block disclosure injected by Code Snippets is not a substitute — both must be present.)
4. **Featured image alt text** present and descriptive (not a filename, not empty, not just the post title).
5. **At least 2 internal links** to existing published articles. Use absolute URLs (`https://aistackscout.com/...`), never relative paths.
6. **All `/go/` links** use absolute URLs (`https://aistackscout.com/go/<slug>`), never relative.
7. **Every `/go/` slug exists** in Pretty Links and resolves to a non-empty target URL. Never test-click an affiliate link — verify via the Pretty Links admin or DB read.
8. **Rank Math focus keyword** is set and appears in: post title, slug, meta description, and the first H2.
9. **No scaffolding labels as headings, and no fabricated first-hand testing.** `post_content` must not contain any scaffold stage name as a literal heading — `Hook`, `Bottom line up front`, `BLUF`, `What this is costing you`, `What to look for before you buy`, `Criteria`, `Reviews`, `Tool A/B/C/D`, `Clear winner`, `Next step`. It must also contain no unsubstantiated first-hand testing claims — `I tested`, `we tested`, `in our testing`, `we used it for`, `we ran`, `hands-on`. Full rule: `.claude/rules/article-writer.md`. Verify: `curl -s "$URL" | grep -oiE '<h[23][^>]*>(hook|bottom line|clear winner|reviews|next step|what this is costing|what to look for)[^<]*</h[23]>'` (must return nothing) and `curl -s "$URL" | grep -oiE 'we tested|i tested|in our testing|we used it for|we ran both|hands-on'` (must return nothing).

## How to verify before publish

Run the verification commands below before flipping post_status to `publish`. Failure on any check is a blocker.

```bash
# Replace <slug> with the post slug
URL="https://aistackscout.com/<slug>/"

# Title length check — must return a number ≤ 60
TITLE="<proposed title here>"
echo -n "$TITLE" | wc -c

# Title sentence-count check — count sentence-ending punctuation. Must be ≤ 1.
echo -n "$TITLE" | grep -oE '[.!?]' | wc -l

# H1 check — must return exactly one entry-title H1
curl -s "$URL" | grep -oE '<h1[^>]*>[^<]*</h1>'

# /go/ link check — every result must start with https://aistackscout.com/go/
curl -s "$URL" | grep -oE 'href="[^"]*\/go\/[^"]*"'
```

For meta description, focus keyword, and featured image alt, read postmeta via the MCP:

```
wp_get_post_meta(ID=<id>) → confirm rank_math_description, rank_math_focus_keyword, _thumbnail_id
```

## Why these blockers exist

Each blocker maps to a documented audit failure or compliance rule. They protect three things:

1. **SEO** — meta description, H1 strategy, internal links, focus keyword consistency.
2. **FTC compliance** — inline `(aff)` markers next to anchor text, in addition to the block disclosure.
3. **Affiliate program rules** — never click `/go/` links to test them; verify slug existence via DB or admin only.

If a check is impossible to perform from the available tooling, mark the post as **NOT READY** and escalate. Never publish on the assumption that an unverifiable check passes.

---

## FTC AUTO-FLIP RULE (Added 2026-05-13)

Hard pre-publish check. Run before any wp_create_post or wp_update_post call.

RULE 1: If post body contains "/go/" OR "(aff)" anywhere in HTML, _suppress_ftc_disclosure MUST equal 0 in post meta. FTC disclosure block must render.

RULE 2: If post body contains NO "/go/" AND NO "(aff)" anywhere in HTML, _suppress_ftc_disclosure MUST equal 1 in post meta. No disclosure block (no material connection exists).

RULE 3: When retrofitting an existing article with affiliate links (swapping direct URLs for /go/ slugs), the SAME call must flip _suppress_ftc_disclosure from 1 to 0. Never leave an article with affiliate links AND suppressed disclosure.

VIOLATION HANDLING: If detected, STOP and tell Mr. Rubio which article violates which rule. Do not publish, do not update, until resolved.
