# What to notice in `design-first-collaboration`

## Pattern demonstrated

**Hard-gated, abstract-to-concrete decomposition.** Before any code, the skill walks through four levels — **Capabilities → Components → Interactions → Contracts** — each requiring explicit user approval before moving to the next. The `<HARD-GATE>` marker tells the AI it cannot combine, skip, or preview levels. The "Red Flags" table at the bottom names specific rationalizations the AI might use to short-circuit the process and counters them in advance. After all four levels are approved, decisions are captured as an ADR with a Mermaid diagram and a key-decisions table — turning ephemeral chat into durable architecture documentation.

## What's specific to my context

- The original skill had hardcoded paths to my client's frontend and backend repos for ADR storage. Those are replaced here with a generic `<repo>/docs/adr/` placeholder.
- The skill is positioned in a workflow chain (`brainstorming → this skill → writing-plans`) that assumes you've installed the [superpowers](https://github.com/obra/superpowers) plugin. If you haven't, the chain references can be ignored — the four levels stand on their own.

## How you'd adapt this

Two ways to use this:

1. **As-is for greenfield features.** The four levels apply to any non-trivial feature — frontend, backend, infra. The hard gate is the discipline.
2. **Trim to two or three levels for smaller work.** For a small change, "Capabilities + Contracts" may be enough. The gate matters more than the count.

Adapt the ADR template (`references/adr-template.md`) to match whatever ADR convention your team already uses. If your team doesn't use ADRs at all, this skill is a way to *introduce* them without ceremony — the AI generates the first few for you.

The transferable insight: **incremental approval catches what wall-of-text approval rubber-stamps.** "Looks fine" on a 4-page design doc is feedback theater; "looks fine" after one paragraph is a real signal.
