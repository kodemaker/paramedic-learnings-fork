---
name: course-review-dep-update
description: Review a PR that updates dependencies — researches breaking changes, migration steps, and changelogs using context7 and GitHub API. Works with npm, Maven/Kotlin, GitHub Actions, and IaC dependencies.
---

# Dependency Update PR Review

Review a pull request that updates dependencies by systematically researching each changed dependency for breaking changes, required migration steps, and changelog highlights.

## Arguments

- PR number or URL (required)
- Repository (optional — defaults to current repo, use `--repo org/name` for cross-repo)

## Stack Context Template (fill this in for your project)

Anchor the review in your stack so the AI doesn't reinvent context every PR. Replace this template with a real table that lists *your* repos, what they do, and which dependencies are load-bearing.

| Repo | Purpose | Stack | Key Dependencies |
|---|---|---|---|
| `<repo-1>` | Infrastructure as code (e.g. AWS CDK, Terraform, Pulumi) | TypeScript / IaC | `aws-cdk-lib`, `constructs`, ... |
| `<repo-2>` | Customer-facing frontend (SPA, SSR app) | TypeScript, React, Vite/Next, ... | UI lib, state lib, routing, http client, ... |
| `<repo-3>` | Backend / BFF / API server | Kotlin / Node / Go / Python | framework, ORM, auth client, AWS SDK, ... |

### How they connect

Sketch the layers. Example:

```
Frontend SPA
    ↓ HTTP/REST
Backend API
    ↓ AWS SDK / JDBC / DB driver
Cloud services / database (deployed by IaC repo)
```

### What this means for dependency reviews

- **Infrastructure** dep updates can change deployed resources — verify CDK/Terraform diffs show only expected changes (asset hashes, not structural).
- **Frontend** dep updates affect the user-facing UI — watch for framework version compatibility, CSS/styling breaking changes in component libraries, and bundle size regressions.
- **Backend** dep updates affect the API layer — watch for language/runtime changes, serialization changes, and SDK API changes that could break integrations.
- A dependency updated in one repo may need a coordinated update in another (e.g., shared OpenAPI codegen versions must match between frontend and backend).

> **Why this template exists:** project-specific context shouldn't live in generic Claude knowledge — it lives next to the team that owns it. Filling in this table for your stack is part of the value of having a custom skill.

## Workflow

### Step 1: Gather PR Data

Run these in parallel:

```bash
# Get structured PR info
gh pr view <PR> --json title,body,files,commits

# Get the full diff
gh pr diff <PR>
```

### Step 2: Detect Project Type

Check which files changed in the diff to determine the dependency ecosystem(s):

| Files Changed | Ecosystem | Audit Tool |
|---|---|---|
| `package.json`, `package-lock.json` | npm | `npm audit` |
| `pom.xml` | Maven/Kotlin/Java | `mvn dependency:tree`, `mvn versions:display-dependency-updates` |
| `.github/workflows/*.yml` | GitHub Actions | manual review |
| CDK/Terraform/Pulumi files | IaC | snapshot diff / `cdk diff` |

A single PR may touch multiple ecosystems (e.g., a backend repo with both `pom.xml` and `package.json`).

### Step 3: Identify Updated Dependencies

Parse the diff to build a table of every dependency that changed:

#### For npm projects
- Look at `package.json` and `package-lock.json` diffs for version changes

#### For Maven/Kotlin projects
- Look at `pom.xml` diffs for `<version>` changes in both `<properties>` and direct dependency declarations
- Note: Maven projects often centralize versions in `<properties>` (e.g., `<kotlin.version>2.1.21</kotlin.version>`) — check there first
- Watch for BOM (Bill of Materials) version changes which affect many transitive dependencies at once (e.g., `kotlin-bom`, `jackson-bom`, `aws-sdk-bom`)

#### For GitHub Actions
- Look at `.github/workflows/*.yml` diffs for `uses:` version changes

#### For all ecosystems
- Note: name, old version, new version, and whether it's a major/minor/patch bump

### Step 4: Research Breaking Changes

For each dependency with a **major or minor version bump**, do the following in parallel:

#### A. Context7 Documentation Lookup

```
1. resolve-library-id for the dependency name
2. query-docs with: "breaking changes migration guide version <new_version> changelog"
```

Context7 works for most popular libraries across ecosystems — npm packages, Kotlin libraries, Java frameworks, and GitHub Actions.

Focus on: breaking changes, deprecated APIs, new required configurations, behavioral changes.

#### B. GitHub/Project Release Notes

```bash
# For npm packages or GitHub Actions (if hosted on GitHub)
gh api repos/<org>/<repo>/releases --jq '.[] | select(.tag_name | test("<version_pattern>")) | {tag: .tag_name, body: .body[0:1500]}'
```

For Maven/Kotlin dependencies that aren't on GitHub, check their project sites:
- Kotlin: https://kotlinlang.org/docs/whatsnew.html
- Jackson: https://github.com/FasterXML/jackson/wiki/Jackson-Release-Notes
- AWS SDK v2: https://github.com/aws/aws-sdk-java-v2/blob/master/CHANGELOG.md

Look specifically for sections titled "Breaking Changes", "BREAKING", "Migration", or "Upgrade Guide".

#### C. For multi-major-version jumps (e.g., v1 → v4)

Fetch the CHANGELOG.md from the repo to understand ALL breaking changes across skipped majors:

```bash
# Fetch changelog from the target version tag
WebFetch the raw CHANGELOG.md from the repo at the target version tag
```

### Step 5: Cross-Reference with Codebase

For each breaking change found, check if it actually affects this project:

- Search the codebase for usage of deprecated/changed APIs
- Check if the project uses the affected modules or features
- Verify configuration files are compatible with the new version

### Step 6: Run Security Audit

Check out the PR branch locally and run a security audit to catch what the update may have missed.

#### For npm projects

```bash
gh pr checkout <PR>
npm ci
npm audit
```

If vulnerabilities are found, check available fixes:

```bash
npm audit fix --dry-run
```

#### For Maven/Kotlin projects

```bash
gh pr checkout <PR>

# Check for known vulnerabilities using OWASP dependency-check (if available)
mvn org.owasp:dependency-check-maven:check 2>/dev/null || echo "OWASP plugin not configured"

# Check for available updates that were missed
mvn versions:display-dependency-updates -DprocessDependencyManagement=false
mvn versions:display-plugin-updates
```

If OWASP dependency-check isn't configured in the project, note this as a recommendation to add it. Alternatively, check deps manually:

```bash
# List the full dependency tree to spot unexpected transitive deps
mvn dependency:tree -DoutputType=text
```

#### For all ecosystems, analyze the output for:

- **New vulnerabilities introduced**: Did the updated deps bring in new vulnerable transitive dependencies? Flag these as blockers.
- **Missed fixes**: Are there known vulnerabilities in deps that were NOT updated in this PR but could have been? Report these as "missed opportunities".
- **Severity triage**: Focus on `high` and `critical` severity. `low` and `moderate` in dev/test-only dependencies are generally acceptable.

If fixes are available without major version bumps, recommend including them in the PR. If fixes require major bumps, note them as follow-up work.

### Step 7: Check Ancillary Changes

- **Snapshot/lockfile changes**: Verify they are consistent with the version bumps (e.g., CDK asset hash changes are expected and safe)
- **New transitive dependencies**: Check if any new packages were introduced
- **Removed `dev: true` flags** (npm): Understand why (usually a dependency now also used in production via a new bundled package)
- **BOM changes** (Maven): A single BOM version bump can change many transitive dependency versions — verify no unexpected libraries were pulled in

### Step 8: Produce Review Summary

Output a structured review in this format:

```markdown
## Dependency Update Review: PR #<number>

### Project Type
[npm / Maven+Kotlin / mixed] — [framework/stack detected]

### Changes Overview

| Dependency | Old → New | Jump | Risk |
|---|---|---|---|
| ... | ... | major/minor/patch | High/Medium/Low |

### Breaking Changes Found

For each breaking change:
- What changed
- Whether it affects this project (and why/why not)
- Migration steps if needed

### Security Audit

- **New vulnerabilities**: [any introduced by the update]
- **Missed fixes**: [known vulnerabilities in deps NOT updated in this PR]
- **Recommendation**: [include additional fixes / acceptable / needs follow-up PR]

### Snapshot/Lockfile Analysis

- Are the changes consistent with the version bumps?
- Any unexpected structural changes?

### Review Checklist

- [ ] Specific action items for the reviewer
- [ ] Things to verify locally or in CI
- [ ] Any follow-up work needed

### Verdict

Safe to merge / Needs changes / Needs discussion
```

## Tips

### npm/Node.js projects
- For **React/Vite SPAs**: check for React version compatibility when upgrading UI libraries (Chakra UI, MUI, tiptap, etc.)
- For **CDK/IaC projects**: snapshot changes showing only asset hash diffs are expected and safe after a cdk-lib bump
- Pinned versions (no `^`) like `"react": "18.2.0"` are intentional — don't suggest adding carets

### Maven/Kotlin projects
- For **Kotlin version bumps**: check language compatibility — Kotlin minor versions can deprecate language features
- For **BOM updates** (kotlin-bom, jackson-bom, aws-sdk-bom): these cascade to many transitive deps — verify with `mvn dependency:tree`
- For **AWS SDK v2 updates**: check if any service client APIs changed
- **Property-based versions** in `<properties>` affect all modules in a multi-module project — verify all modules still compile

### GitHub Actions
- Major version bumps are usually Node.js runtime upgrades — check if the runner version is compatible
- For **configure-aws-credentials**: the OIDC flow has been stable across all major versions; focus on default behavior changes (session duration, credential masking)

### General
- Always check if the project's CI passes on the PR branch before deep-diving — a green CI often means the upgrade is non-breaking for this specific codebase
- For cross-repo reviews, use `gh pr view <PR> --repo org/name`
