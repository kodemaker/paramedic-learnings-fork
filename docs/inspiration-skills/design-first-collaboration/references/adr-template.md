# ADR Template

Use this format when generating ADRs from the design-first-collaboration skill.

```markdown
# ADR-{NNN}: {Title}

## Status

Proposed

## Context

{From Level 1 Capabilities — what we need and why. Include a "Requirements:" bulleted list of the key capabilities.}

## Architecture Overview

{High-level Mermaid flowchart showing component relationships (from Level 2) and data flow (from Level 3). Show the forest, not every tree — keep it readable.}

```mermaid
flowchart TD
    {Component relationships and data flow}
```

## Key Decisions

{Extract 3-6 key decisions from across all levels. Each decision follows this structure:}

### 1. {Decision title}

**Decision:** {What we chose}

**Alternatives considered:**
- {Alternative A}
- {Alternative B}

**Why:** {Rationale for this choice}

**Trade-off:** {What we give up and how we mitigate}

### 2. {Next decision...}

{Continue for each key decision}

## Appendix: Design Levels

<details>
<summary>Full design conversation (click to expand)</summary>

### Level 1: Capabilities
{As presented and approved}

### Level 2: Components
{As presented and approved}

### Level 3: Interactions
{As presented and approved}

### Level 4: Contracts
{As presented and approved}

</details>
```

## Notes

- **Status** starts as "Proposed" — updated to "Implemented (PR #NNN)" after the feature ships
- **Architecture Overview** should have ONE Mermaid diagram, not one per level — synthesize Levels 2 and 3 into a single coherent view
- **Key Decisions** focus on the "why" — alternatives and trade-offs are what make ADRs valuable for future readers
- **Appendix** preserves the full design conversation for context, but behind a collapsible section so it doesn't dominate the document
- If saving to multiple repos (e.g., frontend + backend), adapt the ADR content to each repo's perspective
