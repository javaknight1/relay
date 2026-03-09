Provide a comprehensive analysis of task **$ARGUMENTS** from TODO.md.

## Instructions

1. Find the task in `/TODO.md` by searching for the task ID (e.g., R001, R002)
2. Read both the Task Index entry and the detailed description section
3. Look at related tasks in the same Sprint or category
4. Examine existing similar implementations in the codebase for patterns
5. Do NOT assume knowledge - explain all business concepts and terminology

## Context: Relay

Relay is a managed MCP (Model Context Protocol) server hosting SaaS. Users pick a template (GitHub, Notion, Slack, PostgreSQL, etc.), enter their credentials, and get a live endpoint URL in minutes — no terminal required. The platform handles credential encryption (AES-256), MCP request routing via Cloudflare Workers, tool call logging, and usage-based billing. The main lifecycle is: sign up → create server from template → enter credentials → deploy → get endpoint URL → connect from AI client (Claude Desktop, Cursor, etc.) → monitor usage & logs.

---

## Required Analysis Sections

### 1. Background Context
- What business domain does this task relate to?
- Explain any domain-specific terminology used in the task
- What existing features does this build upon or integrate with?
- For someone unfamiliar with this domain, what do they need to understand first?

### 2. The Problem Statement
- What specific pain point or workflow gap does this address?
- What happens today without this feature? Walk through the manual workaround.
- Why is this problem worth solving? What's the cost of NOT having this?
- Who feels this pain most acutely?

### 3. Feature Overview
- What is this task asking for in plain, non-technical English?
- One paragraph summary that a non-technical stakeholder could understand
- What is the expected outcome when this feature is complete?

### 4. User Journey: How Someone Would Use This
Walk through a complete, realistic scenario:
- Who is the user? (role, typical day, responsibilities)
- What triggers them to use this feature?
- Step-by-step: What do they click, see, and do?
- What decision does this help them make?
- What action do they take after using the feature?
- How does their workflow improve compared to before?

### 5. What The User Would See
- Describe the UI/UX in detail
- Include a mock table, form, list, or dashboard widget as appropriate
- What data fields are displayed?
- What filters, sorting, or search options exist?
- What actions/buttons are available?
- What happens when they click on items?

### 6. Full Scope of Work

#### Backend Requirements
- New models or model changes needed
- New services and business logic
- New API endpoints (method, path, request/response)
- Database schema changes or migrations
- Any integrations with existing services

#### Frontend Requirements
- New pages or components
- Changes to existing pages
- State management needs
- API service calls needed
- Form validation rules

#### Data Flow
- Where does the data come from?
- How is it processed or aggregated?
- Where is it displayed or stored?

### 7. Dependencies & Related Tasks
- What tasks MUST be completed before this one?
- What tasks does this ENABLE after completion?
- What tasks are related but independent?
- Is this part of a larger epic or workflow? Explain the full workflow.

### 8. Acceptance Criteria
List all criteria that must be met for this task to be considered complete:
- Explicit criteria from TODO.md
- Implied criteria based on similar features in the codebase
- Edge cases that should be handled
- Error states and validation requirements

### 9. Verification & Testing
- How can this be verified as working correctly?
- Can it be tested via API/unit tests, or does it require manual UI testing?
- What test scenarios should be covered?

---

## Pre-Implementation Checklist

### Concerns
- What technical challenges or complexities exist?
- What could go wrong or be harder than expected?
- Are there performance considerations?
- Security or permission considerations?

### Open Questions
List specific questions that MUST be answered before starting implementation:
- Ambiguities in the requirements
- Design decisions that need user input
- Business logic that isn't fully specified
- Integration points that need clarification

### Assumptions Being Made
- What assumptions does this analysis make?
- What would change if those assumptions are wrong?

### Recommendations
- Suggestions for implementation approach
- Potential simplifications or phased delivery
- Related improvements that could be bundled

---

## Summary

Provide a final summary paragraph that captures:
- What this feature is in one sentence
- The primary value it delivers
- The main risk or concern
- Whether it's ready to implement or needs clarification first
