# What to notice in `review-dep-update`

## Pattern demonstrated

**Research-driven review using `context7` + GitHub API.** A dependency update PR is mostly a question: *what does this version bump actually change, and does it affect us?* The skill answers that systematically — detect the ecosystem (npm / Maven / Kotlin / GitHub Actions / IaC), identify every changed dependency, then for each major/minor bump look up breaking changes in two places in parallel: `context7` (current docs) and the project's GitHub release notes. Then it cross-references findings against the codebase before producing a structured verdict (Safe to merge / Needs changes / Needs discussion).

The standout structural choice is the **Stack Context Template** at the top — a blank table the reader fills in with their own repos and stacks. That section anchors the AI in the team's specific architecture so it doesn't reinvent context every time.

## What's specific to my context

- The original skill had this Stack Context section pre-filled with my client's repos and stack — frontend SPA, backend BFF, IaC repo with their actual library versions. That's been replaced here with a blank template demonstrating what the section should look like for *your* stack. The instruction in the box (*"why this template exists"*) explains the pattern.
- The Tips section originally called out "Chakra UI, tiptap" by name from my work. It's now generalized to "component libraries" with the same examples kept for illustration.

## How you'd adapt this

1. **Fill in the Stack Context template** with your actual repos. Make it real — listing what you actually use beats listing every dependency you might use. The point of a custom skill is that it knows your specific architecture.
2. **Adjust the ecosystem table** if you use languages this skill doesn't cover (Python/poetry, Go modules, Rust/cargo). The shape transfers; just add the equivalent audit tool.
3. **Drop sections you don't need.** If you don't use Maven, drop the Kotlin-specific tips. If you only ship one repo, drop the cross-repo bits.

The transferable insight: **the most valuable skills are the ones that encode your team's specific architecture.** A generic "review dependency PR" skill exists in the AI's training data — what's *valuable* is the version that knows you have an IaC repo whose CDK snapshot changes are normal-and-safe vs structural-and-not. Your team's context is the moat.
