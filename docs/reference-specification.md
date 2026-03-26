# Reference Specification for Instructors

This document is intentionally more specific than the core product description. It is meant as a reference for course instructors, not as a full specification that participants must follow exactly.

The purpose is to give course leaders a stable reference point for scope, terminology, and expected feature boundaries while still leaving room for teams to think for themselves.

## Product Boundary

The case focuses on ambulance crews and prehospital care.

The application is not intended to model the whole healthcare system. It models one narrow and realistic slice:

- operational guidance used by ambulance staff
- field learning and debrief-driven improvement
- evidence or policy updates that may change current practice
- review and approval by responsible humans

## Primary Users

Primary users in the case:

- ambulance clinicians
- topic owners with clinical responsibility
- editors or approvers
- contributors who submit new evidence or field learning

## Core Product Capabilities

Recommended core capabilities for the course case:

1. Topic discovery
2. Topic details with current guidance and rationale
3. Topic subscription
4. Submission of new information
5. AI-assisted classification and summarization
6. Conflict detection against current guidance
7. Review and approval workflow
8. Version history and traceability

## Minimum Conceptual Model

An implementation should usually end up with concepts similar to:

- Topic
- TopicVersion
- Source
- SourceType
- EvidenceLink
- ChangeProposal
- ApprovalDecision
- Subscription
- Notification

Teams may choose different names, but these concepts should remain recognizable.

## Topic Detail View: Reference Expectations

A topic detail page or screen should usually make it possible to see:

- topic name
- current guidance summary
- explanation of why the guidance exists
- supporting sources
- owner or responsible role
- current version number or revision marker
- recent changes
- subscription status

## Submission Flow: Reference Expectations

A submission flow should usually allow a user to provide:

- title
- source type
- date
- free-text content
- optional suggested topic
- optional attachments or references

The system may then produce:

- a summary
- suggested topic mapping
- a confidence indication
- a possible conflict flag
- a suggested change proposal draft

## Review Workflow: Reference Expectations

The review workflow should reflect the rule that AI proposes and humans decide.

A reasonable review flow is:

1. New source is submitted.
2. AI produces a summary and topic suggestion.
3. AI detects possible conflict with current guidance.
4. A change proposal is created.
5. Topic owner reviews the proposal.
6. Approver approves, rejects, or edits.
7. A new topic version is published if approved.

## Traceability: Reference Expectations

The traceability model should allow a participant to answer questions like:

- Why is this recommendation currently in place?
- Which reports or sources support this version?
- What changed from the previous version?
- Who approved the change?
- When was it published?

## Non-Functional Thinking to Encourage

Even if not fully implemented, participants should be encouraged to think about:

- auditability
- explainability
- role separation
- safe handling of AI-generated suggestions
- consistency of terminology
- simple but extensible data modeling

## What Not to Over-Specify

Instructors should avoid over-constraining:

- exact UI design
- exact persistence model
- exact service boundaries
- exact naming in code
- exact prompt structure for AI steps

Those decisions are valuable parts of the exercise.

## What Good Outcomes Look Like

A good team outcome is not necessarily a complete product. A good outcome is a coherent slice where:

- the user need is clear
- the plan and design are documented
- the ADR explains the decision
- the implementation follows the approved direction
- traceability is considered, even if simplified

## Suggested Use of This Document

Use this document as:

- an instructor reference
- a moderation aid during reviews
- a source for clarifying edge cases when teams diverge too far

Do not use it as a hidden full answer key.