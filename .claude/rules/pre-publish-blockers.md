# Pre-Publish Blockers — MANDATORY

Before publishing ANY article, run through this checklist. Each item is a blocker. If any item fails, **do not publish** — fix it and re-check.

## Blockers

0. **Title length and structure (HARD REJECT).** `post_title` must be **≤ 60 characters** AND must read as **one complete thought**, not two stitched-together sentences. If the title exceeds 60 characters, or contains more than one sentence-ending punctuation mark (`.`, `!`, `?`) before the final character, the validator REJECTS the post before save. **Always show the proposed title to the user for approval before any `wp_create_post` call.**
1. **Rank Math meta description** present, 120–165 chars, contains the focus keyword once.
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
