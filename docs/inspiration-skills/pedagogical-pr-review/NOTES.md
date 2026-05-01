# What to notice in `pedagogical-pr-review`

## Pattern demonstrated

**Per-file approval gates with explicit progress tracking.** The skill turns a PR review into a teaching session: it builds a big-picture orientation first, then walks through files one at a time, asking the user to confirm understanding before moving on. Files are deliberately reordered so understanding *builds* (deleted files first, shared utilities before consumers, tests last). Each file produces either a `[Forbedring N]` task — a numbered improvement that's scannable in PR comments and Slack — or an explicit "no new tasks for this file." Silence is treated as oversight.

## What's specific to my context

- The `[Forbedring N]` prefix is Norwegian (*forbedring* = improvement). I use it because it makes the tasks scannable in my team's Slack threads and PR descriptions. If you adopt this pattern, pick a label that matches *your* team's vocabulary — "Improvement", "Suggestion", "FYI", whatever lands.
- The example dependency diagram references files from a real bid-evaluation refactor I once reviewed; treat it as illustrative.
- No client-specific paths or repos are baked into this skill.

## How you'd adapt this

The skill is generic — the value is in the *flow* (orient → reorder for learning → confirm per file → track improvements as numbered tasks). To adopt:

1. Decide your improvement label and update the prefix everywhere it appears.
2. If your team has a specific PR template or review style (e.g. always link Linear tickets), add a step in Phase 1 to fetch that.
3. Consider whether the "ask before continuing" cadence matches your reviewers' patience — some prefer a single end-of-review summary instead of per-file confirmation.

The most copy-able idea: **the order in which you walk through files is itself a pedagogical choice**. Alphabetical is the default; deliberately reordering for understanding is the move.
