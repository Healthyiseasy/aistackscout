# Tweet Draft for Next Open Slot
Usage: `/tweet [topic]`

Generate ONE Twitter draft for the next OPEN slot today (or tomorrow if today is full). **Default behavior is to save the draft and wait** — the running launchd agent (`com.aistackscout.scheduler`, plist at `~/Library/LaunchAgents/com.aistackscout.scheduler.plist`) picks it up at `scheduled_time`.

If `[topic]` is omitted, pick a topic that fills a category gap (i.e., something untouched in the last 7 days) that fits an eligible format. Briefly justify the choice to the user.

## Steps

1. **Read rule files in full before anything else.**
   - `x-autoposter/rules/twitter-rules.md` (Sections 1–9)
   - `.claude/rules/psychology.md`
   - `.claude/rules/executive-psychology.md`
   - `.claude/rules/affiliate-compliance.md`
   - `.claude/rules/approved-affiliates.md` (governs `has_affiliate` and any `/go/<slug>` use)

2. **Determine the next open slot.**
   - SLOTS in `x-autoposter/generate-drafts.js` (America/Denver): 7:00, 11:00, 14:00.
   - Read `x-autoposter/drafts/*.md` filenames AND recent `x-autoposter/posted/*.md` (or `post_log.json`) to see what's already queued or posted.
   - The next open slot = first slot in chronological MT order, today or tomorrow, with no draft queued AND no posted entry. If today's remaining slots have all passed in MT (e.g., it's 3 PM and 2 PM is gone), fall through to tomorrow's 7 AM.
   - Compute `scheduled_time` via luxon so DST is correct:
     ```js
     import { DateTime } from 'luxon';
     const dt = DateTime.fromObject(
       { year, month, day, hour, minute: 0, second: 0 },
       { zone: 'America/Denver' }
     ).toUTC();
     const scheduled_time = dt.toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
     ```

3. **Audit format rotation. Show the user a table.**
   - Read `x-autoposter/posted/*.md` from the last 7 days; collect `format_id` frontmatter values.
   - Hard cap: `mistake-pattern` max 1 per 7 days → exclude if used.
   - Section 8 rotation: exclude formats used in the last 2 chronological posts (sort by `scheduled_time`).
   - Forward-looking adjacency: if a draft for a surrounding slot already uses a format, the new format must not match — otherwise the rule-of-2 will trigger once they post in sequence.
   - Output: format counts + eligible list. If only one is eligible, take it. If zero, surface to the user — do NOT proceed.

4. **Draft ONE post following the chosen format** — Tool Breakdown / Category Map / Mistake Pattern / Stat-Led Insight / Decision Question. Apply twitter-rules.md Sections 1–5:
   - Length: 220–280 chars (short slot) or ≤ 2000 (long-form, only when explicitly requested).
   - Max 1 em-dash (—) total.
   - `you` ≥ 1.5× `I` (and `you` must appear at least once even when `I` count is 0).
   - Hook in first 12 words: a number, a named tool (3+ chars with at least one lowercase letter, not a sentence-starter stopword), or an outcome verb (saves/cuts/replaces/beats/costs/drops/kills/halves/doubles).
   - Engagement `?` in the last 160 chars; specific, not "Thoughts?".
   - Banned openers (Section 2) — zero hits. Banned phrases — zero hits: "10 to 100 employees", "leverage", "delve", "navigating the landscape", "saves time" without a digit within 60 chars.
   - Section 3 soft cadence — avoid: "in today's…", "it's important to note", "AI-powered", "+" after a digit (use "plus").
   - No external URLs (`https://`, `www.`) in the body. Links live in a reply to the final tweet only (Section 5).
   - Topic dedup: do NOT repeat a tool, category, or angle already covered in the last 7 days. Audit `posted/*` and `drafts/*`.
   - Apply psychology.md (loss framing, peer-specific social proof, authority via honesty, price anchoring, the "so what" filter) and executive-psychology.md (the 5 CEO fears + Cialdini's 7 principles).

5. **Validate locally before saving.** Inline the validator regexes — do NOT `import` from `x-autoposter/generate-drafts.js` (running it triggers `main()` and writes a 3-draft daily batch as a side effect). Run via `node --input-type=module <<'EOF' … EOF`. The script must:
   - Print body length, em-dash count, you count, I count, and what triggered the hook (which word, which rule).
   - Print PASS or FAIL with specific reasons; exit 1 on FAIL.
   - Include a SOFT-CHECK section for Section 3 cadence (informational, not blocking).
   - On FAIL: revise the body and re-validate. Do NOT save until PASS. After 3 failed attempts, surface the failure reason instead of bypassing.

6. **Save the draft** via `writeDraft` from `x-autoposter/lib/drafts.js`:
   ```js
   import { writeDraft } from './lib/drafts.js';
   writeDraft({
     filename: '<YYYY-MM-DD>__<700AM|1100AM|200PM>__<slug>.md',
     frontmatter: {
       title: '<4–8 word internal label>',
       scheduled_time: '<ISO Z from step 2>',
       type: 'value',                      // 'promotional' only when explicitly told
       has_affiliate: <true|false>,        // true only if body contains a /go/<slug> from approved-affiliates.md "Approved" list
       format_id: '<chosen format>',
     },
     body: '<text>',
   });
   ```
   Slot label format: `700AM`, `1100AM`, `200PM` (no leading zero, no colon — matches existing `posted/*` filenames).

7. **Report to the user.** Print:
   1. Full tweet body
   2. Format chosen + which formats were excluded and the specific rule that excluded each
   3. Validator table — length, em-dashes, you-count, I-count, hook trigger, banned check, URL check, engagement-`?` check
   4. Frontmatter (yaml block)
   5. Filename saved (relative to `x-autoposter/`)
   6. Confirmation: `com.aistackscout.scheduler` is loaded (`launchctl list | grep aistackscout` returns a PID with status 0) and will fire at `scheduled_time` MDT/MST

8. **Wait for explicit user response. Default = wait.**
   - "approve" / any non-action phrase → leave queued; the scheduler posts at slot time.
   - "post now" → run `node post.js drafts/<filename>` from `x-autoposter/`. The path arg overrides the next-due check; otherwise the script may report "no draft is due" if `scheduled_time` is in the future. After posting, report `tweet_id`, `posted_at`, and confirm `post_log.json` was updated with a new last entry.

## Hard rules

- NEVER post without explicit approval.
- NEVER run `npm run generate` from this command (writes a full 3-draft day for tomorrow with auto-selected topics, ignoring `[topic]`).
- NEVER `import` `generate-drafts.js` (triggers `main()` side effect).
- NEVER bypass the validator.
- NEVER set `has_affiliate: true` for a tool that isn't on `.claude/rules/approved-affiliates.md` "Approved" list.
- NEVER click a `/go/` link to test it (instant affiliate program ban — verify slugs via the Pretty Links admin instead).
