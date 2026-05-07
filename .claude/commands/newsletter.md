# Newsletter Draft

Read .claude/rules/psychology.md. Write a newsletter draft for The AI Stack Signal. Follow the Newsletter Structure section — hook, signal, proof, recommendation, P.S. Keep it 700–900 words. Make it scannable. CEO audience.

Topic: $ARGUMENTS

## Schedule Calculation — MANDATORY

Newsletters ONLY ship on Tuesdays and Thursdays at 12:00 PM Mountain Time.

At runtime, compute the next valid send slot using the current date/time in America/Denver:

- If today is **Tuesday before 12:00 PM MT** → schedule for today at 12:00 PM MT
- If today is **Tuesday at or after 12:00 PM MT** → schedule for the upcoming Thursday at 12:00 PM MT
- If today is **Wednesday** → schedule for the upcoming Thursday at 12:00 PM MT
- If today is **Thursday before 12:00 PM MT** → schedule for today at 12:00 PM MT
- If today is **Thursday at or after 12:00 PM MT** → schedule for the upcoming Tuesday at 12:00 PM MT
- If today is **Friday, Saturday, Sunday, or Monday** → schedule for the upcoming Tuesday at 12:00 PM MT

Render the result as the first line of the output in this exact format:

```
SCHEDULED: <Weekday>, <Month> <Day>, <Year> at 12:00 PM MT
```

Example: `SCHEDULED: Tuesday, May 5, 2026 at 12:00 PM MT`

Use the full weekday name and full month name. No abbreviations. No timezone abbreviations other than `MT`.

## Output Structure — MANDATORY

The output is split into one metadata line plus three Beehiiv fields. The user reads the schedule line, then copies title and subtitle into Beehiiv's title and subtitle fields, then pastes everything from line 7 onward into the body field.

Exact structure:

```
LINE 1: SCHEDULED: <Weekday>, <Month> <Day>, <Year> at 12:00 PM MT
LINE 2: <blank>
LINE 3: Title (plain text, no #, no markdown, no quotes)
LINE 4: <blank>
LINE 5: Subtitle (plain text, no #, no markdown, no quotes)
LINE 6: <blank>
LINE 7+: Body content
LAST 3 LINES: P.S. paragraph, then <blank>, then Rubio
```

Title: one line, ≤ 60 chars, loss-aversion or curiosity gap, no emojis.
Subtitle: one line, ≤ 110 chars, completes or sharpens the title's promise.
Body: starts at line 7, uses `## H2` for sections, single `\n` between paragraphs (no blank lines inside the body block). Sign-off block is the only blank line in the body — it sits between the P.S. paragraph and `Rubio`.

## Beehiiv Body Format — MANDATORY

The body pastes directly into Beehiiv's /ai AI Writer. Every stray marker becomes manual cleanup.

Hard rules (all MANDATORY — if any fail on output, fix silently and re-output without asking):

1. Body paragraph breaks use a SINGLE `\n`, NEVER `\n\n`. Beehiiv adds its own paragraph spacing on paste, so double newlines compound into excessive whitespace. The ONLY blank line allowed inside the body block is the one between the P.S. paragraph and the `Rubio` sign-off. The blank lines at LINE 2, LINE 4, and LINE 6 are field separators for schedule/title/subtitle, not body content.
2. Use real `## H2` markdown headings. Never `[H2]`, `[H1]`, or any bracketed placeholder. No `# H1` inside the body — the title at LINE 3 is the only headline.
3. No horizontal rule lines (`---`) anywhere in the draft.
4. No "Word count:" footer, no "Sources used" footer, no meta-commentary before or after the draft.
5. Sign-off: every draft ends with `Rubio` on its own line, preceded by a blank line, preceded by the P.S. paragraph. No "Best," "Cheers," or other prefix. Just `Rubio`.
6. Em-dashes: max 1 total in the entire draft (schedule line + title + subtitle + body). Prefer periods or colons. Use the single allowed em-dash only for the strongest reveal in the piece.
7. Affiliate links: NONE unless the user explicitly requests one in the topic prompt (e.g. "include /go/jasper"). Default is no /go/ links.
8. Output is the draft and only the draft (schedule line through `Rubio`). Copy, paste, done.

## Self-Check Before Output — MANDATORY

Before sending the draft, run this checklist against the output. If any item fails, fix it silently and re-check. Only output when all pass.

- [ ] Line 1 starts with `SCHEDULED:` and matches the format `SCHEDULED: <Weekday>, <Month> <Day>, <Year> at 12:00 PM MT`
- [ ] The scheduled date is a Tuesday or Thursday
- [ ] The scheduled date is in the future (or today, if before 12:00 PM MT and today is Tue/Thu)
- [ ] Line 2 is blank, line 3 has a title, line 4 is blank, line 5 has a subtitle, line 6 is blank, line 7 starts the body
- [ ] Body word count is between 700 and 900 (count from line 7 through the line above `Rubio`, excluding the schedule/title/subtitle and the sign-off)
- [ ] Em-dash count is ≤ 1 across the entire draft
- [ ] `Rubio` is present on its own final line
- [ ] A `P.S.` paragraph exists immediately above the blank line that precedes `Rubio`
- [ ] Zero `[H2]`, `[H1]`, `[BOLD]`, `[LINK]`, or other bracketed placeholders
- [ ] Zero `---` horizontal rules
- [ ] Zero double-newline sequences inside the body block (line 7 onward, except the single blank line above `Rubio`)
- [ ] No /go/ links unless the user requested one

If a check fails, fix and re-output the full draft. Do not narrate the fix or list what was changed. Just send the clean version.
