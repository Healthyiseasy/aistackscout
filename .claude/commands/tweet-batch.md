# Tweet Batch — Generate tomorrow's drafts

Usage: `/tweet-batch`

Generate drafts for tomorrow's 3 posting slots (7:00 AM, 11:00 AM, 2:00 PM Mountain). Each draft lands in x-autoposter/drafts/ with the correct scheduled_time. The running scheduler daemon picks them up and posts at slot time.

## Steps

1. Read rule files first:
   - x-autoposter/rules/twitter-rules.md (Sections 1-9)
   - .claude/rules/psychology.md
   - .claude/rules/executive-psychology.md

2. Scan x-autoposter/posted/*.md (last 7 days) and x-autoposter/drafts/*.md. Collect format_id values, topics covered, and tools mentioned.

3. Pick 3 formats for tomorrow's 3 slots. Rules:
   - No format repeats in last 2 chronological posts
   - mistake-pattern max 1 per 7 days
   - Forward-looking adjacency: the 3 new drafts must not repeat formats next to each other
   - No topic or tool overlap with last 7 days

4. Compute scheduled_time for each slot via luxon America/Denver (DST-safe):
   - Slot 1: tomorrow 7:00 AM MT → ISO Z
   - Slot 2: tomorrow 11:00 AM MT → ISO Z
   - Slot 3: tomorrow 2:00 PM MT → ISO Z

5. Draft each post following twitter-rules.md Sections 1-5:
   - 220-280 chars
   - Max 1 em-dash
   - "You" >= 1.5x "I"
   - Hook in first 12 words: number, named tool, or outcome verb
   - Engagement question in last 160 chars
   - Banned openers and phrases: zero hits
   - No external URLs in body (link in reply only)
   - ZERO /go/ affiliate links in any tweet — ever

6. Run validateDraft on each draft. If any fails, fix and re-validate. Do NOT save failing drafts.

7. Save each to x-autoposter/drafts/ via writeDraft from lib/drafts.js:
   - Filename: <YYYY-MM-DD>__<700AM|1100AM|200PM>__<slug>.md
   - Frontmatter: title, scheduled_time, type: 'value', has_affiliate: false, format_id

8. Show me all 3 drafts before confirming:
   - Full tweet body for each
   - Format chosen + why
   - Validator results table
   - Frontmatter
   - Filename
   - Confirm scheduler is loaded (launchctl list | grep aistackscout)

9. Wait for "approve" before finalizing. Default = wait.

## Hard rules
- NEVER post without explicit approval
- NEVER include /go/ affiliate links in any tweet
- NEVER bypass the validator
- has_affiliate is ALWAYS false for tweets
- NEVER import generate-drafts.js (triggers main() side effect)
