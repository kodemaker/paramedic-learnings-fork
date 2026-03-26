# User Stories for GitHub Project Issues

These user stories are written to be small enough to become GitHub Project issues. They are intentionally concrete, but still leave room for participants to make design and implementation decisions.

## Topic Discovery

### Story 1: List ambulance topics

As an ambulance clinician, I want to see a list of operational topics so that I can quickly find relevant guidance.

Possible acceptance criteria:

- show a list of topics
- include topic title and a short summary
- show last updated information

### Story 2: Search topics by keyword

As an ambulance clinician, I want to search topics by keyword so that I can find relevant guidance without browsing manually.

Possible acceptance criteria:

- provide a text search input
- return matching topics based on title or content
- show an empty state when no topics match

### Story 3: Filter topics by area

As an ambulance clinician, I want to filter topics by clinical or operational area so that I can narrow the list to the kind of guidance I need.

Possible acceptance criteria:

- support at least one filter dimension
- show active filters clearly
- allow filters to be cleared

### Story 4: View topic details

As an ambulance clinician, I want to open a topic and read its current guidance so that I understand the current recommendation.

Possible acceptance criteria:

- show title, summary, and detailed guidance
- show who owns the topic
- show when the topic was last updated

### Story 5: See why the guidance exists

As an ambulance clinician, I want to see the rationale behind a recommendation so that I understand why I am expected to work this way.

Possible acceptance criteria:

- show a rationale or explanation section
- link the explanation to one or more supporting sources

## Subscription and Notifications

### Story 6: Subscribe to a topic

As an ambulance clinician, I want to subscribe to a topic so that I am notified when guidance changes.

Possible acceptance criteria:

- allow a user to subscribe from the topic page
- show whether the user is currently subscribed

### Story 7: Notify subscribers about changes

As a subscribed user, I want to be notified when a topic is updated so that I can review the new guidance.

Possible acceptance criteria:

- create a notification when a new topic version is published
- include a link or reference to the updated topic

## Submission of New Information

### Story 8: Submit a debrief report

As an ambulance clinician, I want to submit a debrief report so that field learning can be reviewed and reused.

Possible acceptance criteria:

- capture title, date, and free-text content
- save the report as a source item

### Story 9: Submit a research finding

As a contributor, I want to submit a research finding so that new evidence can be considered against current guidance.

Possible acceptance criteria:

- support a source type for research
- capture source metadata and summary text

### Story 10: Classify source type

As a reviewer, I want each submitted item to have a source type so that evidence can be grouped and interpreted consistently.

Possible acceptance criteria:

- support at least a small fixed list of source types
- show the source type in the source view

## AI-Assisted Analysis

### Story 11: Generate a source summary

As a topic owner, I want a submitted source to have an AI-generated summary so that I can review it faster.

Possible acceptance criteria:

- create and store a generated summary
- show that the summary is system-generated

### Story 12: Suggest related topics

As a reviewer, I want the system to suggest which topic a new source belongs to so that triage is faster.

Possible acceptance criteria:

- generate one or more suggested topics
- show that the suggestions are proposals, not final decisions

### Story 13: Flag possible conflict

As a topic owner, I want the system to flag when new information may conflict with current guidance so that I can review it quickly.

Possible acceptance criteria:

- compare submitted material to current topic guidance
- mark items with a possible conflict state
- show a short reason for the flag

## Review and Approval

### Story 14: Create a change proposal

As a topic owner, I want a possible conflict to produce a draft change proposal so that I can review and refine the suggested update.

Possible acceptance criteria:

- create a change proposal linked to a topic and one or more sources
- include proposed updated guidance text

### Story 15: Review a change proposal

As a topic owner, I want to review and edit a proposed change so that the final text reflects professional judgment.

Possible acceptance criteria:

- show the proposed text
- allow the text to be edited before approval

### Story 16: Approve or reject a proposal

As an approver, I want to approve or reject a change proposal so that only validated guidance becomes current.

Possible acceptance criteria:

- record an approval decision
- record who made the decision
- record when the decision was made

### Story 17: Publish a new topic version

As an approver, I want an approved proposal to create a new topic version so that the updated guidance becomes visible to users.

Possible acceptance criteria:

- create a new topic version on approval
- mark the new version as current

## Traceability and History

### Story 18: View topic version history

As an ambulance clinician, I want to see previous versions of a topic so that I can understand how guidance has changed over time.

Possible acceptance criteria:

- list previous versions
- show publication date for each version

### Story 19: See what changed

As a reviewer, I want to compare topic versions so that I can understand what changed between revisions.

Possible acceptance criteria:

- show a human-readable summary of the change
- link the change to the proposal that caused it

### Story 20: See supporting sources for a version

As an ambulance clinician, I want to see which sources support a topic version so that I can assess the basis for the guidance.

Possible acceptance criteria:

- link versions to one or more source items
- show source titles and types

### Story 21: See who approved a version

As a reviewer, I want to see who approved a topic version so that the approval path is traceable.

Possible acceptance criteria:

- show approver identity on the version view
- show approval timestamp

## Planning and Documentation Workflow Stories

### Story 22: Create a feature plan before implementation

As a development team, we want to write a feature plan before implementation so that scope, assumptions, and acceptance criteria are explicit.

Possible acceptance criteria:

- create a committed plan document for the selected issue
- include scope, assumptions, risks, and acceptance criteria

### Story 23: Create design sketches before implementation

As a development team, we want to produce design sketches before implementation so that the proposed user flow is visible and reviewable.

Possible acceptance criteria:

- attach or commit one or more sketches for the feature
- show the key states or flow relevant to the issue

### Story 24: Write an ADR before implementation

As a development team, we want to write an ADR before implementation so that key design decisions and tradeoffs are recorded.

Possible acceptance criteria:

- create an ADR document for the feature
- include context, decision, alternatives, and consequences

### Story 25: Gate implementation on ADR approval

As a course instructor, I want implementation to start only after ADR approval so that teams practice explicit decision-making before coding.

Possible acceptance criteria:

- implementation work is linked to an approved ADR
- pull request review includes the ADR status

## Suggested Prioritization

If the course needs a smaller starting backlog, a good first slice is:

1. Story 1: List ambulance topics
2. Story 4: View topic details
3. Story 5: See why the guidance exists
4. Story 8: Submit a debrief report
5. Story 11: Generate a source summary
6. Story 13: Flag possible conflict
7. Story 14: Create a change proposal
8. Story 16: Approve or reject a proposal
9. Story 18: View topic version history
10. Story 22: Create a feature plan before implementation
11. Story 24: Write an ADR before implementation