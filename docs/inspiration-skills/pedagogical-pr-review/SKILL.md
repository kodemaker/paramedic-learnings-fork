---
name: pedagogical-pr-review
description: >
  File-by-file PR review designed for learning and understanding, not just approval.
  Use this skill when the user asks to "walk me through this PR", "explain this PR",
  "review this PR with me", "help me understand these changes", "go through the PR
  file by file", or any variation that implies they want to understand the changes
  rather than just get a pass/fail verdict. Also use when reviewing PRs for onboarding,
  mentoring, or knowledge transfer — any time understanding matters more than speed.
---

# Pedagogical PR Review

A structured file-by-file walkthrough of a pull request that prioritizes understanding
over speed. The reviewer explains *why* changes make sense, highlights design patterns,
and checks comprehension before proceeding.

This is different from a standard code review. A standard review finds bugs and style
issues. This review teaches the reader what the PR does, why the approach was chosen,
and what patterns they should take away.

## Process

### Phase 1: Orientation

Before touching individual files, build the big picture:

1. **Fetch the PR** — get title, description, file list, and full diff
2. **Explain the problem** — what bug or feature motivated this PR? Use diagrams
   (ASCII flow diagrams, tables, before/after comparisons) to make the problem visceral
3. **Explain the solution** — at a high level, what approach was chosen? Why this approach
   over alternatives? Show the before/after architecture
4. **Ask the user which file categories to skip** — common skippable categories:
   - Auto-generated files (codegen, lockfiles)
   - Translation/locale files
   - Config files with trivial changes
   - Test snapshots

### Phase 2: File Planning

Build the file list and present it as a numbered checklist with status markers:

```
Progress: [0/12]

 1. src/hooks/useFoo.ts              (NEW)
 2. src/hooks/useBar.ts              (DELETED)
 3. src/components/Widget.tsx
 ...
```

**Ordering matters.** Don't go alphabetically. Order files so that understanding builds:

1. **Deleted files first** (or paired with their replacement) — understanding what was
   removed and why helps the reader grasp what the new code replaces
2. **New shared utilities/helpers** — these are referenced by other files, so explain
   them before their consumers
3. **Core logic files** — the heart of the change
4. **Consumer files** — components/pages that use the new logic
5. **Tests last** — they validate everything above, so they make more sense after
   seeing the implementation

If two files are tightly coupled (e.g., a deleted hook and its replacement, or an
interface and its implementation), present them together in one step.

Show a **dependency diagram** if the PR has more than 5 files:

```
Deleted: useSelectBid.ts ──┐
Deleted: useRemoveBid.ts ──┤
                           ├──► NEW: useSelectBids.ts ──► BidEvaluation.tsx
NEW: BidUtils.tsx ─────────┤                              EvaluationTable.tsx
                           │                              SelectPriceCell.tsx
Reducer changes ───────────┘
```

### Phase 3: File-by-File Walkthrough

For each file (or file group):

1. **Update the progress counter**
   ```
   Progress: [3/12] ███░░░░░░░░░
   ```

2. **Show the relevant diff** — fetch or display the changes for this file. For small
   changes, show the full diff. For large files, show only the changed sections with
   enough context to understand them.

3. **Explain what changed and why** — connect changes back to the problem from Phase 1.
   Use phrases like:
   - "This is where the race condition lived — notice how each cell fired its own mutation..."
   - "This was extracted from X because Y also needs it now..."
   - "This new parameter enables Z, which was missing before..."

4. **Highlight patterns worth learning** — when a change demonstrates a reusable
   technique (debounce stability in React, Immer-compatible helpers, context providers
   replacing prop drilling), call it out in an insight block. Keep insights specific to
   the code, not generic programming advice.

5. **Note issues if any** — style violations, potential bugs, missing edge cases. But
   frame them as observations, not blockers. This is a learning review, not a gate.
   **Track each improvement as a task** using TaskCreate with a `[Forbedring N]` prefix
   in the subject, where N is the next sequential number across this review (1, 2, 3, ...).
   The task tool's own ID isn't visible in copy-pastes outside the tool — putting the number
   in the subject makes forbedringer scannable in PR descriptions, Slack threads, and code
   comments. Include enough context in the description to verify and draft a review comment
   later. **If a file produces no forbedringer, state that explicitly** ("no new tasks for
   this file") rather than implying it by absence — silence reads as oversight.

   **Consolidating tasks**: PR-description edits are usually better as one holistic re-audit
   at the end (single `[Forbedring N]` for the whole description) rather than N tiny
   per-finding tasks. The description will drift as code fixes land; one audit-after-fixes
   is tighter than N parallel edits.

6. **Ask before continuing** — end each file with a question:
   - "Clear? Ready for file 4?"
   - "Does this make sense, or should I go deeper on the debounce pattern?"
   - "Any questions about this file before we move on?"

   Wait for the user's response. If they ask a follow-up, answer it fully before
   proceeding. If they say "yes", move to the next file.

### Phase 4: Wrap-Up

After all files:

1. **Summarize the review** — key findings (issues found, patterns used, architecture
   decisions)
2. **Offer to help draft an approval/feedback message** — if the user wants to leave
   a review comment, help them write it (in their preferred language)
3. **Ask if they want a deeper dive** on any specific file or concept

## Guidelines

**Pacing:** Match the user's pace. If they're saying "yes" quickly, they understand —
don't over-explain. If they ask follow-up questions, slow down and go deeper.

**Diagrams:** Use ASCII diagrams liberally for:
- Data flow (before/after the change)
- Race conditions and timing
- Component/dependency relationships
- State machine transitions

**Tone:** Collegial, not lecturing. You're a teammate walking them through code, not a
professor grading homework.

**Depth:** Not every file deserves the same depth. A one-line import change gets two
sentences. A new 200-line hook gets a section-by-section breakdown. Calibrate.

**Context:** Connect every file to the overall narrative. The reader should always know
where they are in the story: "This is the component that *uses* the hook we just
reviewed" or "This is the old code that *caused* the bug."
