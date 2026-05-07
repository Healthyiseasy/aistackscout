# Tweet Generator with Ghost Pass
Usage: /tweet [topic]

1. Read `.claude/rules/` AND `x-autoposter/rules/twitter-rules.md` before doing anything.
2. Audit the last 7 days of posts in `x-autoposter/posted/`. Log format, topic, opening pattern of each. Identify what NOT to repeat.
3. Pick a format that doesn't repeat the last live post. Apply rotation rules from `twitter-rules.md` Section 2 (the 5 educator formats: Tool Breakdown, Category Map, Mistake Pattern, Stat-Led Insight, Decision Question). Mistake Pattern capped at 1/week.
4. **DRAFT V1** — generate the post. Educator voice, hook with a number or named tool in the first 12 words, length-appropriate (≤280 short, ≤2000 long). No banned openers, no banned phrases, em-dash cap of 1, "you" appears at least 1.5x more than "I".
5. **GHOST PASS** — rewrite V1 against these rules, regenerate as V2. NEVER skip this step:
   - Vary sentence length aggressively (short / long / short / medium pattern)
   - Drop one unexpected specific detail per tweet (a real number, a real time of day, a real product name — something a generic AI wouldn't add)
   - Kill AI cadence patterns: no "it's not X, it's Y", no rule-of-three lists, no em-dashes, no "here's the thing"
   - Use contractions ("you're", "what's", "it's")
   - Start at least one sentence with "And" or "But"
   - One sentence fragment per tweet allowed
   - Read aloud test: if it sounds like a LinkedIn post, rewrite
6. Run V2 through the actual `validateDraft` function from `x-autoposter/generate-drafts.js`. Extract the function source by reading the file (do NOT `import` the module — that triggers `main()` and writes a full daily batch). If validation fails, retry the ghost pass up to 3 times. If still failing, surface the failure reason to the user instead of bypassing.
7. Show user **V1 (before)** and **V2 (after)** side-by-side, with the specific ghost-pass changes annotated (sentence-length variance, specific detail added, And/But sentence start, fragment used). Wait for explicit user approval before posting.
8. On approval: post via the `twitter-api-v2` client in `x-autoposter/lib/twitter.js`. Append the entry to `x-autoposter/post_log.json` so rate-limit tracking stays accurate. Report tweet_id and live X URL.
9. NEVER post without explicit user approval. NEVER skip the ghost pass. NEVER `npm run generate` or `import generate-drafts.js` from this command — both create a full daily batch as a side effect.
