# Inspiration Skills

These are real custom skills I use in my own work, lightly cleaned for sharing. They're meant to be **read**, not run. The point isn't that you copy them and use them — the point is the *shape*: what makes a skill specific enough to be useful, where the line is between team-specific knowledge and generic advice, and how a skill encodes a workflow that would otherwise live in your head.

> **Egne skills for egne behov** — your own skills for your own needs. The lesson isn't "use these skills." It's "your skills should look something like this, but for *your* work."

## What you'll find here

| Skill | Pattern it demonstrates |
|---|---|
| [pedagogical-pr-review](./pedagogical-pr-review/) | Per-file approval gates + numbered improvement tasks |
| [design-first-collaboration](./design-first-collaboration/) | Hard-gated decomposition (Capabilities → Components → Interactions → Contracts) with ADR generation |
| [pentest](./pentest/) | Thin orchestration layer over an MCP-backed external tool |
| [review-dep-update](./review-dep-update/) | Research-driven review using `context7` + GitHub release notes, anchored in a stack-context template |

Each folder has:
- **`SKILL.md`** — the actual skill file Claude Code would load.
- **`NOTES.md`** — what to notice when reading: the pattern demonstrated, what's specific to my context, and how you'd adapt it.
- **`references/`** *(some skills only)* — supporting reference material the skill links to.

## What these are NOT

- **Not auto-loaded by Claude Code.** They live under `docs/`, not `.claude/skills/`. If you want to actually try one, copy the folder into your own `~/.claude/skills/` and adapt it first.
- **Not generic templates.** They're snapshots of skills that exist because *I* needed them in *my* work. Generality was deliberately removed where it would obscure the point.
- **Not maintained.** This is a teaching artifact. The live versions evolve in my own setup; these copies are a moment in time.

## Suggested reading order

If you're new to writing custom skills, read in this order — easiest pattern to most complex:

1. **`pentest`** — short, single-purpose, shows the "phased tool runner" shape.
2. **`pedagogical-pr-review`** — generic, demonstrates conversational pacing and per-step gates.
3. **`design-first-collaboration`** — introduces hard gates, red-flag tables, and the abstract→concrete pattern.
4. **`review-dep-update`** — the most ambitious: stack-context anchoring, multi-ecosystem branching, structured verdict output.

For each one, read `NOTES.md` first to understand what to look for, then read `SKILL.md` to see how it's expressed.

## What to do after reading

Pick **one** workflow you do repeatedly that the AI keeps getting wrong (or that you keep having to re-explain). Write a skill for it. The first version will be embarrassingly short — that's correct. Iterate as the AI's behavior reveals what's missing.
