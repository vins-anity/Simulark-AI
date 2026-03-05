# Architecture Generation Accuracy and Streaming Design

**Date:** 2026-03-06

## Goal

Improve Simulark's architecture generation so `startup`, `default`, and `enterprise`
modes behave consistently and accurately, with enterprise mode explicitly preferring
the best architecture recommendation over user preferences when those preferences
conflict with scalability, resilience, compliance, or operational simplicity.

## Problem Summary

The current system prompt and generation flow mix several concerns without a clear
precedence order:

- mode constraints
- user preferences
- architecture validation and autofix
- provider/model-specific behavior
- streaming UX

This makes the generator too easy to steer off-course, especially in `enterprise`
mode. The system can preserve preferences too literally, producing weaker or less
coherent architectures instead of the best architecture for the request.

The streaming UI also feels less intelligent than it should because it infers stages
from arbitrary keywords and surfaces raw output noise rather than meaningful progress.

## Product Rules

### Mode Accuracy Rules

- `startup`: bias toward speed, low cost, and managed services.
- `default`: bias toward balanced delivery, maintainability, and production readiness.
- `enterprise`: bias toward correctness, resilience, compliance, scale, governance,
  and observability.

### Preference Handling Rules

- User preferences are soft constraints by default.
- The generator should preserve preferences when they are compatible with the best
  architecture.
- When preferences conflict with the best architecture, the generator should:
  1. produce the strongest recommendation first
  2. produce the closest preference-aligned viable alternative second
  3. explain the conflict and tradeoff briefly

### Ranking Priority

The system should reason in this order:

1. satisfy the functional requirements and architecture mode
2. choose the strongest architecture and stack for those requirements
3. reuse compatible user-selected technologies where they do not degrade the result
4. reject or de-prioritize incompatible preferences with brief decision notes

## Proposed Solution

### 1. Prompt Policy Contract

Strengthen `lib/prompt-engineering.ts` so the model receives an explicit ranking and
conflict-resolution contract instead of broad guidance.

The prompt should state:

- architecture correctness comes before preference matching
- enterprise mode is intentionally opinionated
- preferences must be checked for overlap and compatibility
- the model may reject preferences if a stronger architecture is available
- the model must produce a primary recommendation and a preference-aligned
  alternative when needed

### 2. Preference Compatibility Summary

Add lightweight server-side summarization before prompt assembly so the model receives
normalized preference context:

- normalized preferred frontend/backend/cloud/data technologies
- overlap opportunities
- likely conflicts
- a directive on whether preferences should be reused, softened, or overridden

This should not replace the model's judgment. It should improve consistency by giving
the model an explicit architectural decision frame.

### 3. Structured Output Contract

Require generation output to contain structured sections before or alongside the graph
payload:

- `analysis`
- `selectedArchitectureStrategy`
- `preferenceConflicts`
- `recommendedStack`
- `preferenceAlignedAlternative`
- `nodes`
- `edges`

This gives the UI better material to stream and display while preserving the existing
graph generation path.

### 4. Stronger Enterprise Validation

Extend post-generation validation to better detect enterprise weaknesses:

- redundant full-stack plus backend combinations
- missing gateway/load-balancer boundaries when enterprise requires them
- missing observability/security layers
- obvious preference-driven downgrades in resilience or architecture quality

The validator should still auto-fix safe graph issues, but it should also preserve
decision notes so the user can see why the final architecture differs from their
preferences.

### 5. Better Streaming UX

Upgrade the chat stream so it reflects meaningful architecture workflow stages:

- understanding requirements
- checking preference overlap
- ranking candidate architectures
- generating the selected design
- validating and normalizing the graph

The stream should avoid exposing raw JSON fragments or weak keyword-derived fake
"thinking". Instead it should render stable, human-readable progress and a clearer
assistant response once generation completes.

### 6. Responsiveness and Performance

Improve the assistant panel and streaming components by:

- reducing unnecessary rescans/parsing of large streamed text
- stabilizing layout on smaller viewports
- keeping the streaming card compact and readable on mobile and tablet widths
- avoiding noisy state churn that makes the panel feel jittery

## UX Outcome

When a user asks for an enterprise architecture while preferring a conflicting stack,
the assistant should answer like this:

- "Recommended architecture": the best enterprise-grade stack and topology
- "Preference-aligned option": the closest viable variant using the user's preferred
  tech where safe
- "Why these differ": short explanation of the tradeoff

This keeps the model open-minded but still smart and opinionated.

## Files Likely to Change

- `lib/prompt-engineering.ts`
- `app/api/chat/route.tsx`
- `lib/architecture-validator.ts`
- `components/canvas/AIAssistantPanel.tsx`
- `components/canvas/StreamingMessage.tsx`

Possible supporting changes:

- `lib/provider-registry.ts`
- `lib/tech-normalizer.ts`
- `lib/architecture-quality.ts`

## Risks

- Over-constraining the prompt could reduce creativity or make some providers less
  flexible.
- Structured output changes could break architecture extraction if not handled
  defensively.
- Streaming UX can regress if the final response shape is not coordinated with the
  frontend parser.

## Mitigations

- Keep the output parser tolerant of partial/legacy responses.
- Treat preference conflict notes as additive metadata, not as the only source of
  truth for graph extraction.
- Verify with both lint/tests and browser QA across desktop and mobile widths.
