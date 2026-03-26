# Example Application: Experiential Learning for Ambulance Services

This example application is designed as a course case for agentic coding in teams. It describes a solution where ambulance crews, clinical leads, and editors can collect, review, and improve knowledge about procedures, equipment, field methods, and operational guidance used in prehospital care.

The goal of the application is to make operational learning and evidence searchable, explainable, traceable, and continuously improvable. New information arrives from multiple sources, is interpreted and structured by a language model, and is then handled in a workflow where AI suggests changes and humans approve them.

## Why This Application Exists

In ambulance services and other prehospital settings, practice evolves continuously based on field experience, research, policy updates, equipment changes, and structured debriefs. At the same time, it is difficult to maintain a shared understanding of:

- which topics exist
- what the current recommendation or practice is
- why that practice exists
- what evidence or experience the recommendation is based on
- what has changed recently
- who approved a change

The application addresses this by combining knowledge management, operational learning, and traceability in one system.

## Core Idea

The application organizes knowledge around topics. A topic may represent, for example, hypothermia management, airway handling, use of a specific device, medication handling, patient handover, scene workflow, or a debrief-related practice in ambulance operations.

Each topic contains:

- a summarized core guidance or recommendation
- rationale and professional explanation
- linked source material
- revision history
- responsible people or teams
- subscribers who want update notifications

## User Needs and Functional Scope

### 1. Explore and Follow Topics

Users should be able to find, explore, and subscribe to topics relevant to ambulance work.

Example capabilities:

- see an overview of all topics
- filter topics by clinical area, topic type, status, or last updated date
- search topics with free text
- subscribe to a topic to receive notifications about new field learning or approved changes
- see who owns the topic
- read a short summary of the current guidance
- find an explanation of why the guidance is the way it is

A key user need is to ask questions such as:

> Why should we not actively warm a pulseless patient with no spontaneous circulation?

The application should then be able to show:

- the current recommendation
- the clinical or operational rationale
- references to the underlying sources
- any caveats or exceptions
- revision history if the recommendation was changed recently

### 2. Add New Information

New knowledge should be captured continuously, regardless of source type or format.

Examples of information that may be submitted:

- new research findings
- debrief reports
- meeting notes
- policy or regulatory changes
- internal clinical notes
- incident descriptions or deviations
- updated external guidance from trusted professional bodies

When information is submitted, the system should be able to:

- register metadata about source, date, contributor, and related topic
- suggest which existing topics the material belongs to
- create a new topic suggestion if the information does not fit the current structure
- summarize the content with help from a language model
- suggest which parts represent facts, interpretation, recommendation, or potential conflict with current practice

### 3. Identify Conflicts with Current Knowledge

A central part of the application is detecting when new experience or evidence challenges what is currently treated as correct practice.

Examples:

- a debrief report says the recommended procedure was followed, but led to an unexpected outcome
- a new study contradicts established field practice
- a policy change makes current guidance invalid
- a clinical review meeting clarifies a topic in a way that changes the interpretation of current guidance

The application should be able to:

- analyze new material against the current core guidance for a topic
- flag a possible conflict, deviation, or need for clinical review
- notify the topic owner that new field experience may challenge current knowledge
- create a proposed update to the core guidance
- let human approvers accept, reject, or edit the proposal before publication

A typical example could be:

> I followed this procedure, but the patient deteriorated. During debrief we concluded that a different approach would likely have been better.

In a case like this, the system must not update the core guidance automatically. It should instead propose a review, explain why a conflict was detected, and route the case to a human decision-maker.

### 4. Traceability

Traceability is a core requirement. Users must be able to understand where a recommendation comes from, how it has changed, and who was responsible for the change.

The application should therefore track that:

- the topic guidance is linked to its supporting basis
- that basis may consist of multiple source types
- the topic's core guidance is versioned
- each version shows what changed
- each change is tied to relevant source material
- it is visible who proposed the change
- it is visible who approved the change
- the time of proposal, review, and publication is logged

Users should be able to look back through history and see:

- previous versions of a topic
- which sources triggered the change
- the rationale for approval
- any editorial changes made by the human approver

## AI and Human Curation

Incoming information is interpreted by a language model. AI is used to structure, summarize, and suggest relationships, but it is not the final decision-maker for changes to clinical or operational guidance.

Recommended division of labor:

- AI suggests topic linkage, summarization, and possible conflict with current knowledge
- AI proposes draft updates to core guidance or rationale
- humans evaluate relevance, risk, and professional correctness
- humans approve, edit, or reject the proposal

This makes the application well suited for demonstrating agentic collaboration between people and AI while keeping professional control with accountable roles.

## Important Roles in the Application

Examples of roles that fit the course case:

- ambulance clinician or field professional who reads and uses the topics
- contributor who submits new information
- topic owner who evaluates conflicts and proposals
- editor or approver who publishes updated guidance
- system agent or AI assistant that analyzes input and suggests changes

## Typical Domain Objects

The following concepts can serve as a starting point for the data model and for course issues:

- Topic
- Topic Version
- Source
- Experience Report
- Debrief Report
- Research Finding
- Meeting Note
- Policy Change
- Change Proposal
- Approval
- Notification
- Subscription
- Topic Owner

## Example User Flow

1. A user submits a new debrief report from ambulance operations.
2. The system analyzes the content and links the report to an existing topic.
3. The language model finds that the report appears to challenge the current recommendation.
4. The topic owner is notified and receives a proposed change with a summarized rationale.
5. The topic owner reviews the sources, edits the text if needed, and sends it for approval.
6. The approver publishes a new version of the topic.
7. Subscribers receive a notification that practice or rationale has changed.
8. The history view shows what changed, why, and who approved it.

## What This Repository Is For

This repository is not only a product description. It is a starting point for practical course work, where participants begin with an empty shell and build functionality step by step.

The course focuses on:

- breaking the problem into concrete issues
- using GitHub Project as the planning and execution surface
- solving issues with agentic tools and working methods
- combining hands-on engineering with AI-supported analysis, implementation, and review

See also [docs/course-setup.md](docs/course-setup.md), [docs/reference-specification.md](docs/reference-specification.md), and [docs/user-stories.md](docs/user-stories.md) for course-oriented material.