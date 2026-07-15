# Manual Post Publisher
Usage: /publish-post [post ID or title]
1. Read ALL files in .claude/rules/ before doing anything.
2. Use the aistackscout MCP to pull all existing posts (published + drafts).
3. Find the post specified by the user.
4. Before writing, compare the post topic against every existing article — DO NOT publish if it duplicates an existing topic or tool focus.
5. **Check `.claude/rules/approved-affiliates.md` against every tool you plan to feature.** Tools on the approved list use `/go/<slug>` Pretty Links + `(aff)` markers. Tools NOT on the list use direct homepage links only — no `/go/` wrapper, no `(aff)` marker, no affiliate disclosure language for that tool. The single article CTA must point to an approved tool, or be replaced with an internal action if none qualify. If unsure which tools are approved, ask the user before drafting.
6. **Title gate (HARD REJECT).** Draft the proposed `post_title`. Verify it is **≤ 60 characters** AND reads as **one complete thought, not two stitched sentences** (no more than one sentence-ending punctuation mark before the final character). **Show the title to the user for explicit approval before any `wp_create_post` call.** If the user rejects or revises, repeat until approved. The validator REJECTS over-length or multi-sentence titles before save.
7. Rewrite the full article following psychology.md — pain-first opening, BLUF verdict upfront, criteria section, max 4 tool reviews with real 2026 pricing and one honest weakness each, clear winner, single CTA.
8. Apply executive-psychology.md — frame through CEO fear responses and loss aversion, not feature hype.
9. Follow affiliate-compliance.md — proper disclosures, compliant link formatting (Rule 0 governs /go/ Pretty Links).
10. Follow link-validation.md — verify all links are real before publishing.
11. Minimum 1500 words. Set the Rank Math focus keyword.
12. Before publishing, use the aistackscout MCP to search the WordPress media library for a relevant featured image. If one exists, attach it to the post. If none exists, flag it and do NOT publish — instead report: "No featured image found. Upload one to Media Library and re-run." Never publish a post without a featured image.
13. Do not set any FTC-disclosure suppression meta. The FTC disclosure block uses always-accurate wording ("AIStackScout is reader-supported. Some of our articles contain affiliate links...") and displays on every post automatically via the Code Snippets hook — it is correct whether or not the post contains affiliate links.
14. Publish. Report the post title and live URL when done.
