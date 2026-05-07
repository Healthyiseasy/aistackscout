# Audit Script — Known Bugs & False Positives

Log of audit-script defects discovered during remediation runs. Patch the script before the next audit so it stops producing false positives that waste remediation time.

---

## 2026-04-26 — `audit-2026-04-26.md` false positives

### Bug 1 — Meta description "missing" false positive (HIGH)

**What the script reported.** PHASE 2 of the audit flagged 11 posts (IDs 732, 733, 734, 735, 841, 862, 873, 900, 914, 925, 963) as **missing meta descriptions** entirely.

**What is actually true.** All 11 posts have a `rank_math_description` value set in postmeta, in the 144–158 character range, and on-brand per `psychology.md`. Verified via `wp_get_post_snapshot` reading the `meta` block.

**Likely root cause.** The audit subagent looked for the wrong meta key — probably checked for `rank_math_meta_description` or `_yoast_wpseo_metadesc` instead of the correct Rank Math key, which is `rank_math_description` (no `meta_` prefix). When the lookup returned `null`, the audit reported "missing" instead of marking the field UNVERIFIED.

**Fix for next audit run.** When checking meta description compliance, the rule should be:

> Flag a post only if `rank_math_description` is one of:
> - empty / null / not present
> - length > 165 chars (truncation risk in SERPs)
> - length < 120 chars (under-utilizes available space)
>
> Do **not** flag if length is in the [120, 165] band and the field is non-empty.

Before reporting any meta key as "missing," confirm the meta key name against the plugin's own documentation. For Rank Math the canonical keys are: `rank_math_focus_keyword`, `rank_math_description`, `rank_math_title`, `rank_math_canonical_url`, `rank_math_robots`, `rank_math_seo_score`.

### Bug 2 — Rank Math `seo_score` reported as "missing" (MEDIUM)

**What the script reported.** All 22 audited posts marked as "Rank Math SEO score missing — UNVERIFIED → effectively a fail."

**What is actually true.** Rank Math computes SEO score on render in many configurations and does not always persist it to postmeta. The "missing" label conflated "not persisted to postmeta" with "score is bad."

**Fix for next audit run.** If `rank_math_seo_score` is not present in postmeta, mark the per-post status as **UNVERIFIED via API — confirm via Rank Math admin column** and do not roll the result into the FAIL count.

### Bug 3 — In-body H1 false positive (HIGH — confirmed via curl)

**What the script reported.** PHASE 3 flagged posts 732, 733, 734, 735 as "0 in-body H1 → FAIL: missing heading hierarchy."

**What is actually true.** Confirmed via `curl | grep '<h1'` on all four URLs: each rendered page contains exactly one `<h1 class="entry-title">` containing `post_title`, output by the active theme. The "in-body" H1 the audit was looking for would be a *second* H1 on the rendered page, which would itself be an SEO failure.

The audit was also inconsistent about it — posts 841, 862, 873, 900, 914, 925, 963 are structured identically (BLUF starts at H2, no in-body H1) and the audit did **not** flag them. So the H1-count rule was applied unevenly.

**Fix for next audit run.** Either:
1. Drop the "in-body H1 required" check entirely. The page H1 comes from the theme template; the in-body content should start at H2.
2. Or, if keeping the check, query the rendered HTML (not `post_content` raw) and count `<h1>` tags on the full rendered page. Flag only if count != 1.

Apply the rule consistently across all posts of a given structure.

### Bug 4 — Internal-link counts unreliable (LOW)

**What the script reported.** Per-post internal-link counts were computed by counting `href="https://aistackscout.com/` substrings in `post_content`.

**What is actually true.** That regex includes the affiliate-disclosure footer link, so every post is over-counted by exactly 1. It also misses links written with relative paths (e.g. `href="/about/"`) and may double-count posts that link to themselves.

**Fix for next audit run.** Strip the standard footer disclosure block before counting, normalize relative + absolute paths to a canonical form, deduplicate by target URL, and exclude self-references.

### Bug 5 — Image-alt missing false positive on IDs 702 and 732 (HIGH — confirmed)

**What the script reported.** PHASE 5 of the audit said IDs 702 and 732 each have 1 in-body image with a missing or empty alt attribute.

**What is actually true.** Both posts have exactly one in-body `<img>` and both carry a full descriptive alt:

- ID 702: `alt="Executive viewing consolidated KPIs and real-time metrics on a single AI-powered business dashboard"`
- ID 732: `alt="AI-generated ad creative variations for SMB performance marketing campaigns on Meta and Google Ads"`

The audit script almost certainly matched a stray `alt=""` token in a different attribute, or matched on an empty string from a non-image element. False positive count for this rule: 100% in this audit run.

**Fix for next audit run.** Use a proper HTML parser (not a regex) to extract `<img>` tags and their attributes. Verify the alt attribute is empty string (not just present) before flagging.

### Bug 6 — Slug-prefix mismatch produced false MATCH on /go/ link audit (RETRACTED — see Bug 7)

**Status:** This bug entry, and the "fix" it proposed, were themselves wrong. The 13-row "BROKEN" table in this entry is a **false positive**. Manual verification in WP Admin → Pretty Links on 2026-04-28 confirmed all 13 bare slugs (`go/jasper`, `go/otter`, `go/monday`, `go/freshdesk`, `go/intercom`, `go/tidio`, `go/zendesk`, `go/clickup`, `go/asana`, `go/wrike`, `go/toggl`, `go/adcreative`, `go/spark`) exist correctly and resolve. The article links were never broken. The audit was. See Bug 7 for the actual root cause.

The original Bug 6 narrative is preserved below for historical reference, but **do not act on its findings**.

---

**What the script reported.** The Critical Addendum to the post-fix audit ran a /go/ link existence check and reported many references as MATCH that were actually BROKEN. Net effect: under-counted broken affiliate redirects across the published library.

**What is actually true.** Pretty Links in this install stores slugs in the `wp_prli_links` table **with the `go/` prefix included** (e.g., `go/jasper-ai`, not `jasper-ai`). The audit script searched without the prefix, then fell back to substring matching — which silently returned TRUE for any row whose stored slug merely *contained* the queried value.

When matching is corrected to do an **exact equality** check on the prefixed slug (`slug = 'go/<X>'`), **13 distinct slugs across 11 articles are BROKEN**, including high-traffic anchors:

| Article slug | Pretty Link slug actually stored | Articles affected |
|---|---|---|
| /go/jasper | go/jasper-ai | 28, 607, 608, 609, 611 |
| /go/otter | go/otter-ai | 28, 611, 612 |
| /go/monday | go/monday-com | 841 |
| /go/freshdesk | go/freshdesk-2 | 862 |
| /go/intercom | go/intercom-2 | 862 |
| /go/tidio | go/tidio-2 | 862 |
| /go/zendesk | go/zendesk-2 | 862 |
| /go/clickup | go/clickup-2 | 841 |
| /go/asana | go/asana-2 | 841 |
| /go/wrike | go/wrike-2 | 841 |
| /go/toggl | go/toggl-track | 873 |
| /go/spark | go/spark-ai | 733 |
| /go/adcreative | go/adcreative-ai | 732 |

The full re-run table (every `/go/<X>` reference across all 22 articles, with stored slug and TRUE/FALSE match flag) is in the 2026-04-27 chat-log for the corrected audit run.

**Likely root cause.** The script computed `slug = substring_after("/go/", href)` then ran `SELECT 1 FROM wp_prli_links WHERE slug LIKE '%<value>%'`. Two compounding errors: (1) it dropped the `go/` prefix that this install actually stores, and (2) it used `LIKE %...%` instead of `=`, which made `/go/jasper` falsely match `go/jasper-ai`. The smoking gun is the 3 records where the WP `pretty-link` post permalink falls back to the post ID (e.g., `?pretty-link=977` for Ideogram, `?pretty-link=776` for Mixpanel, `?pretty-link=838` for Planful) — those are records whose `prli_links.slug` value contains a `/` character that WP's `post_name` field cannot represent, which is direct evidence that the `/` (and therefore the `go/` prefix) is in the stored slug.

**Fix for next audit run.** When checking /go/ link existence:

> 1. For each `/go/<X>` reference in `post_content`, construct the lookup key as the literal string `"go/<X>"`.
> 2. Search `wp_prli_links.slug` for an **exact equality** match (`slug = 'go/<X>'`). Never use `LIKE` or substring matching for slug existence.
> 3. Mark BROKEN only if the exact slug does not exist.
> 4. If a candidate `pretty-link` post's permalink renders as `?pretty-link=<numeric-id>` rather than `?pretty-link=<slug>`, that's the WP wrapper falling back to the ID because the stored slug contains characters WP slugs cannot represent. Do not flag those as missing — verify via the custom table directly (`SELECT slug FROM wp_prli_links WHERE id = <id>`).
> 5. After fixing the broken slugs at the source (either updating the article links or creating the missing Pretty Link record), re-run the audit and confirm all `/go/<X>` resolve to an exact-match row before publishing.

### Bug 7 — Audit treated `wp_posts.post_name` as authoritative for `/go/` slug existence; it is not (CRITICAL — confirmed)

**What the script reported.** The 2026-04-27 re-run (Bug 6 in this log) declared 13 distinct article slugs BROKEN across 11 articles. The user then verified manually in WP Admin → Pretty Links that all 13 bare slugs exist correctly. Zero of the 13 were actually broken. The audit produced a 100% false-positive rate on the BROKEN list.

**What is actually true.** The Pretty Links plugin keeps two slug-shaped values that are **not synced**:

1. **`wp_posts.post_name`** — the WordPress post slug, set when the `pretty-link` custom post is first created (sanitized from the post title via WP's slugifier). Visible via the WP REST API and the `wp_get_posts` MCP tool. This is what the audit was reading.
2. **`wp_prli_links.slug`** — the canonical slug Pretty Links uses to resolve `/go/<X>` redirects. Edited via WP Admin → Pretty Links → Edit → "Pretty Link" field. **This is the field that determines whether `/go/<X>` resolves.** The available WP MCP does not expose this field.

When a Pretty Link record is first created with title "Jasper AI", `post_name` is sanitized to `jasper-ai` and `prli_links.slug` is initially the same. If the user later edits the slug in admin to `jasper`, **`prli_links.slug` updates to `jasper` but `post_name` stays at `jasper-ai`.** The two fields drift.

The audit read `post_name`, found `jasper-ai`, compared against the article's `/go/jasper`, and reported BROKEN. The plugin's actual redirect logic reads `prli_links.slug` (= `jasper`), matches, and resolves correctly. This applied to all 13 false positives.

**Confirming evidence.** Three records have public-facing permalinks of `?pretty-link=<numeric-id>` rather than `?pretty-link=<slug>` (Ideogram=977, Mixpanel=776, Planful=838). That is WP falling back to the post ID because `post_name` is empty or non-representable for those records — direct, visible evidence that `post_name` and `prli_links.slug` can be different. For the 13 false-positive records, the divergence is invisible (because `post_name` happens to be a *plausible* slug like `jasper-ai`), but it is the same drift.

**Likely root cause.** Two compounding errors in the audit script:

1. The script assumed `wp_posts.post_name` is authoritative for Pretty Links redirect resolution. It isn't. `wp_prli_links.slug` is.
2. The script had no way to detect or warn about this — it confidently reported BROKEN status from a data source it should have been treating as a non-authoritative proxy.

Bug 6's proposed "fix" (switching from substring `LIKE` to exact equality) reused the same wrong data source and made the false positives more confident. Strictness on the wrong field is worse than fuzziness on the wrong field.

**Fix for next audit run.** The /go/ link existence check is **not safely runnable from the available WP MCP**. Do not produce a BROKEN list from `post_name` data. Until one of the following access paths is available, the audit must report `/go/<X>` slug existence as **UNVERIFIED** and route to manual confirmation:

> 1. **Direct read of `wp_prli_links.slug`** — via wp-cli (`wp db query "SELECT slug FROM wp_prli_links WHERE slug LIKE 'go/%'"`), phpMyAdmin, or a SQL-capable MCP. This is the only authoritative source.
> 2. **Pretty Links plugin REST endpoint** — if the plugin exposes one (check `/wp-json/prli/v1/links`). Currently not surfaced through the AISTACKSCOUT MCP.
> 3. **Live HTTP probe of `/go/<X>`** — banned by `affiliate-compliance.md` ("never test affiliate links — instant program ban"). Not an option.

If none of those are available, the rule is:

> When auditing `/go/<X>` references, list every distinct slug used in `post_content` and report it with status **UNVERIFIED — confirm manually in WP Admin → Pretty Links**. Never call a slug BROKEN from `post_name` data alone. The cost of a false-positive BROKEN list is wasted remediation time and (worse) silently retargeted article links pointing at the wrong destination.

**Process fix beyond the script.** Two new rules going forward:

1. **No claim of "BROKEN" without a primary source.** `post_name` is a proxy, not a primary source. If the audit cannot reach the primary source, the answer is UNVERIFIED, not BROKEN.
2. **A "fix" that uses the same data source as the original bug is not a fix.** When investigating a false positive, identify the data source the script consulted vs. the data source the user-facing system actually consults. If those differ, the script is reading the wrong field — no amount of stricter matching on the wrong field will help.

---

## 2026-04-28 — `audit-2026-04-28.md` new finding pattern

### Bug 8 — `/go/` slug usage from rendered HTML over-counts by ~17x because of Pretty Links keyword auto-replace (HIGH — confirmed)

**What the audit observed.** First pass extracted `/go/<X>` anchors from each post's rendered HTML and built a slug-usage table. The result was wildly inflated: `/go/buffer` appeared in **all 23 articles**, `/go/jasper` in 5+ articles where Jasper is not reviewed, `/go/publer` in 18 articles, etc. Total `/go/` anchors counted: **1,822 across 23 posts** — clearly impossible if the editorial intent is 4 affiliate tools per article.

**What is actually true.** The Pretty Links plugin's **Keyword Replacement** feature is active site-wide. Per-link `_prli_keywords` postmeta entries (e.g., Buffer's `"Buffer, AI social media tool, social media scheduling, Buffer AI"`) cause the plugin to scan rendered post content and silently wrap any matching text in an `<a class="pretty-link-keyword" href="/go/<slug>">…</a>` anchor — without modifying `post_content`. These auto-injected anchors are NOT editorial. They appear in articles that do not review the linked tool.

**How to detect in HTML.** Auto-injected anchors carry `class="pretty-link-keyword"`. Editorial anchors written in `post_content` carry no class (or whatever class the editor added). When the same script filtered `class="pretty-link-keyword"` out, the slug-usage table dropped from inflated noise to 65 distinct editorial slugs across 23 posts — sane numbers.

**Fix for next audit run.** When extracting `/go/<X>` anchors from rendered HTML for slug-usage and inline-`(aff)` audits, exclude any anchor with class `pretty-link-keyword`:

```python
for a in art.find_all('a', href=True):
    if 'pretty-link-keyword' in (a.get('class') or []):
        continue   # plugin auto-injection, not editorial
    if '/go/' in a['href']:
        # ... process editorial anchor
```

Better still, do `/go/` slug audits against `post_content` directly (via `wp_get_post`) when possible — `post_content` is the editorial source of truth. Use rendered HTML only for live-page checks (H1 count, meta-desc, og tags, sitemap). The two extraction paths give different answers and conflating them produces the false positives this audit nearly produced.

**Secondary finding from the same data.** The keyword auto-replace itself is a HIGH compliance risk worth reporting separately (1,720 affiliate anchors injected into non-affiliate context across 23 posts, no inline `(aff)` markers, no per-anchor disclosure). Reported in `audit-2026-04-28.md` finding H1 — not an audit bug, an actual site issue. But the audit script needs to know to disambiguate the two so it doesn't conflate "the slug is referenced 23 times" (auto-inject) with "the slug is editorially used in 23 articles" (would be a real concern).

### Bug 9 — Footer legal-page slug guesses were wrong; the real footer URLs are different (LOW)

**What the audit reported.** Spec checked `/terms-of-service/` and `/cookie-policy/`. Both returned non-200 (`/terms-of-service/` 404; `/cookie-policy/` 301 redirect). First pass nearly flagged both as failing footer checks.

**What is actually true.** The site's footer links to `/terms/` (200) and `/cookie-policy-eu/` (200). The 301 from `/cookie-policy/` is intentional Complianz behavior (it splits EU vs non-EU policies). All four legal pages are present and reachable — just at slightly different URLs than the spec assumed.

**Fix for next audit run.** Don't hardcode legal-page slug guesses. First step: parse the homepage footer and extract the actual `<a>` hrefs ending in `disclosure | privacy | terms | cookie`. Then HEAD-check those. The footer is the source of truth for what URL the site claims as canonical, not the audit-spec list.

### Bug 10 — `pretty-link-keyword` class count does not equal active keyword-replace anchors (HIGH — corrects Bug 8's framing)

**What the audit reported.** `audit-2026-04-28.md` finding H1 ("1,720 keyword-auto-injected `/go/` anchors across all 23 posts") was treated as live runtime injection from the Pretty Links keyword-replacement feature, and counted as a HIGH revenue/compliance risk.

**What is actually true.** Manual verification in WP Admin → Pretty Links → Options on 2026-04-28 confirmed **"Enable Keyword Replacements" is OFF**. The 1,720 `class="pretty-link-keyword"` anchors in rendered HTML are legacy artifacts — either manually-inserted Pretty Link anchors written into `post_content` (the plugin's "Insert Pretty Link" editor button stamps the same class), or historical auto-replacements that were baked in before the global toggle was turned off. Per-link `_prli_keywords` postmeta still exists as dormant data (e.g., Buffer's `"Buffer, AI social media tool, ..."`), but those keywords don't fire at runtime when the global toggle is off.

`prli_options` does **not** include a visible toggle in its top-level payload when keyword replacement is off; the toggle is stored separately or omitted entirely. So absence of a `link_replacement_type` (or equivalent) key in `prli_options` is itself consistent with the feature being off — not evidence the feature is on.

**Fix for next audit run.** A non-zero `pretty-link-keyword` class count is **not sufficient** to conclude that auto-replace is actively injecting anchors. Audit must check **both**:

1. **The runtime toggle.** Read `prli_options` and check for the keyword-replacement field (field name is plugin-version-dependent — common candidates: `link_replacement_type`, `replace_type`, `replace_keywords`). Also look in `prli_keyword_replacements` or similar adjacent options. If no toggle field is present in `prli_options`, treat that as "OFF" not "ON" — Pretty Links does not silently default ON.
2. **The class count in rendered HTML.** Counts the residue.

The interpretation rule:

| Toggle | Class count | Verdict |
|---|---|---|
| OFF | 0 | clean — no legacy classes |
| OFF | > 0 | **legacy artifacts only** (manually-inserted anchors or pre-toggle injections baked into `post_content`). Not a runtime issue. Optional cleanup. |
| ON | > 0 | active runtime injection — HIGH compliance risk. Bug 8 framing applies. |
| ON | 0 | toggle on but no keyword matches firing — reportable as misconfigured/unused. |

Until the toggle field is read and confirmed, the verdict is UNVERIFIED, not HIGH. Bug 8's filter-the-class advice still applies for slug-usage tables (don't conflate auto-injected with editorial), but the **separate finding** of "auto-replace is actively firing" requires the toggle check.

**Process echo of Bug 7.** Same lesson, different layer: a high-confidence claim ("auto-replace is firing 1,720x") was made from a non-authoritative data source (rendered HTML class count) without checking the authoritative source (the runtime toggle). The right answer when the toggle hasn't been read is UNVERIFIED, not HIGH.

---

## How to use this log

Before running the next audit, open this file and confirm each fix is applied to the audit prompt or script. After each audit run, append any new false positives discovered during remediation. The point is to keep the audit honest so remediation time is spent on real problems, not on chasing the audit's own bugs.
