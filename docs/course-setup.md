# Course Setup for the Example Application

This document explains how the example application can be used in a course about agentic coding in teams.

The case is intentionally scoped to ambulance crews and prehospital work. That keeps the domain narrow enough for a course while still reflecting a real part of healthcare where procedures, equipment usage, field decisions, debriefs, and traceable learning matter.

## Course Goals

Participants should practice building an application from a minimal starting point by using a modern delivery workflow with:

- issues in a GitHub Project
- team-based work with clear responsibilities
- AI assistants and agentic workflows
- iterative delivery in small slices
- quality control through review, testing, and explicit design decisions

The course assumes that participants begin with an empty shell and a small set of tools. The domain is rich enough to support parallel work across teams, but constrained enough that participants must make thoughtful decisions instead of filling in a large amount of boilerplate.

## Why This Case Works Well

This application works well as a course case because it combines:

- clear user needs
- a realistic professional domain
- searchable and explainable knowledge
- incoming evidence from multiple source types
- human approval over AI-generated suggestions
- strong traceability requirements
- many natural slices that can be implemented as independent issues

It is also a good fit for teaching disciplined use of AI: participants can use AI to analyze requirements, propose designs, and implement code, while still being responsible for the final structure and quality.

## Course Narrative

The team is building a learning and knowledge application for ambulance crews. The product helps prehospital personnel understand current guidance, discover why a recommendation exists, submit new field experience, and manage changes when new evidence or operational learning challenges current practice.

Participants do not receive a fully detailed specification for every feature. Instead, they receive:

- a product description
- a set of issues in a GitHub Project
- expectations for how to plan and document the work before implementation

This is deliberate. The course should force participants to think, refine, question assumptions, and make engineering decisions rather than simply follow a fixed recipe.

## Recommended Delivery Workflow

One of the course objectives is to teach participants to work in an explicit sequence before writing implementation code.

Recommended workflow for each feature:

1. Pick or refine a GitHub issue.
2. Create a feature plan describing scope, assumptions, risks, and acceptance criteria.
3. Produce low-fidelity design sketches for the user flow or screen states.
4. Write an ADR describing the architectural or design decision.
5. Commit the plan, sketches, and ADR to GitHub.
6. Open a pull request for review of the ADR and supporting material.
7. Implement the feature only after the ADR is approved.
8. Validate the implementation with tests, review comments, and updates to documentation.

This workflow matters because it trains participants to:

- think before coding
- separate discovery from implementation
- make design decisions visible
- document tradeoffs
- use pull requests for more than code review

## What Participants Should Be Expected to Produce

For a meaningful feature, the team should normally produce the following artifacts before implementation:

- a short feature plan
- one or more design sketches
- an ADR
- a pull request containing those artifacts

The implementation phase should begin only after the ADR has been reviewed and approved.

## Suggested Folder Structure for Course Artifacts

You can ask participants to store planning and design artifacts in a structure like this:

- `docs/plans/` for feature plans
- `docs/sketches/` for sketches or screen drafts
- `docs/adr/` for architecture decision records

This is a recommendation, not a hard requirement. The important part is that participants commit the material and use it as part of the review workflow.

## How Much Specification to Provide

The course should not over-specify the solution.

Recommended balance:

- provide a strong domain narrative
- define a few non-negotiable constraints
- provide reference stories and possible acceptance criteria
- leave room for teams to decide data model details, workflows, UI choices, naming, and implementation strategy

That keeps the exercise open enough for real engineering work, while still preventing teams from drifting too far away from the intended learning goals.

## Non-Negotiable Constraints for the Case

Even with open-ended design work, a few things should remain fixed:

- the domain is ambulance and prehospital learning, not healthcare in general
- incoming information may come from debriefs, operational incidents, research, policy updates, and equipment guidance
- AI may suggest interpretation and change proposals
- humans must approve changes to core guidance
- the system must preserve traceability between guidance, sources, approvals, and versions

## Suggested Epics for the GitHub Project

Examples of larger work items or epics:

- define the domain model for topics, sources, guidance versions, and approvals
- build topic overview and discovery
- implement search and filtering for ambulance-relevant topics
- add topic subscription and notification flow
- model incoming evidence and field learning
- build AI-assisted analysis of new material
- detect potential conflict with current guidance
- implement review and approval workflow
- show revision history and supporting evidence
- support explanation views that answer why a recommendation exists

## Working Style with Agentic Coding

The course can demonstrate a workflow like this:

1. A participant selects a GitHub issue.
2. They use AI to understand the requirement, inspect the codebase, and identify a delivery strategy.
3. They ask AI to help draft a plan, acceptance criteria, sketches, or an ADR.
4. They review and refine those artifacts themselves.
5. After approval, they use AI to help implement the feature, tests, and supporting documentation.
6. They use AI again to review changes, identify risks, and summarize what was delivered.

The key lesson is not just productivity. The key lesson is disciplined use of AI within a team workflow.

## Suggested Roles in the Exercise

Examples of roles participants may take:

- product lead who clarifies intent and priorities
- developer who implements the feature
- reviewer who checks quality, risk, and traceability
- domain representative who answers ambulance-specific questions
- AI operator who experiments with prompts, decomposition, and agentic strategies

The roles do not need to be rigid, but they help teams reflect on how human collaboration and AI collaboration differ.

## What Participants Should Practice

This case is well suited for practicing how to:

- translate a domain description into a concrete model
- turn vague needs into actionable issues
- define acceptance criteria before implementation
- ask better follow-up questions
- produce plans and sketches before coding
- write ADRs with clear tradeoffs
- use AI without losing control of consistency and quality
- design for traceability from the start

## Example Course Progression

One possible progression:

1. Start with a short walkthrough of the domain and the product intent.
2. Give teams a prioritized list of issues.
3. Ask them to choose one feature and deliver a plan, sketches, and ADR first.
4. Review those artifacts in a pull request.
5. Approve the ADR.
6. Let the team implement the feature.
7. Repeat with a second feature that introduces conflict detection, approval, or traceability.

This progression keeps the early steps simple while still leading toward a system that demonstrates the full flow from field learning to updated operational guidance.

## Discussion Topics for Instructors

This case supports discussion about:

- what AI should and should not decide on its own
- how to model human approval clearly
- what makes a good issue versus a vague task
- how teams avoid inconsistent AI-generated solutions
- how traceability and revision history affect the design
- when an ADR is useful and when it is unnecessary overhead

## Deliverables in This Repository

This repository can contain several layers of material:

- the product and domain description
- the course setup and workflow expectations
- an optional reference specification for instructors
- issue-ready user stories for the GitHub Project

See also [README.md](../README.md), [docs/reference-specification.md](reference-specification.md), and [docs/user-stories.md](user-stories.md).