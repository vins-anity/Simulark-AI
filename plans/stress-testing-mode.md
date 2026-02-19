# Stress Testing Mode Plan (Killer Feature)

## Goal

Ship a first-class **Stress Testing Mode** that turns architecture diagrams into executable resilience experiments with measurable pass/fail outcomes.

## Product Outcome

Users can:
- Select stress scenario presets from their current graph
- Run scenario simulations with baseline vs stressed metrics
- See blast radius and bottlenecks directly on the canvas
- Export a test report with findings and remediation recommendations

## Why This Matters

Chaos mode currently visualizes failures manually. Stress Testing Mode upgrades this into:
- deterministic scenario plans
- repeatable runs
- quantifiable SLO validation

## Scope Phases

## Phase 1: Scenario Planning (1 sprint)

Deliverables:
- Graph-aware scenario generator from nodes/edges
- Presets:
  - traffic spike
  - node failure
  - dependency latency
  - queue backlog
  - data store hotspot
- Scenario metadata model saved in project `metadata.stressTesting`
- Export integration:
  - include `references/stress-test-plan.md` in skill package

Implementation notes:
- Foundation module exists: `/Users/vinsanity/dev/personal/Simulark-AI/lib/stress-testing-plan.ts`
- Skill export already emits this plan.

## Phase 2: Run Engine + Timeline UI (2 sprints)

Deliverables:
- `StressModePanel` with:
  - scenario picker
  - run controls (start/pause/abort)
  - live status timeline
- Simulation runtime in store:
  - active scenario state
  - elapsed time
  - synthetic metric mutation by scenario profile
- Canvas overlays:
  - bottleneck highlights
  - impacted path heatmap

Technical plan:
- Extend `/Users/vinsanity/dev/personal/Simulark-AI/lib/store.ts` with:
  - `stressMode` boolean
  - `activeScenario`
  - `runStatus`
  - `runMetrics[]`
- Keep chaos mode for manual injections; stress mode is orchestrated and deterministic.

## Phase 3: SLO Evaluation + Reports (1 sprint)

Deliverables:
- SLO config per project:
  - p95 latency ceiling
  - max error-rate
  - minimum availability
- Automated verdict per run:
  - pass/fail by criteria
  - violated checks
  - top remediation suggestions
- Downloadable report:
  - markdown + JSON artifact

## Architecture Additions

## Data Model

Project metadata extension (`metadata.stressTesting`):
- `version`
- `scenarios[]`
- `defaultSLOs`
- `lastRuns[]`

## APIs (proposed)

- `POST /api/stress-tests/plan`
  - input: `{ nodes, edges }`
  - output: scenario plan
- `POST /api/stress-tests/run`
  - input: scenario id + seed + duration
  - output: stream of progress + metrics + events
- `GET /api/stress-tests/runs/:id`
  - output: run summary and report data

## Success Metrics

- 80% of generated plans have at least 3 meaningful scenarios
- <2s plan generation latency at p95
- 95% of runs produce deterministic replay with the same seed
- >=30% of active users run stress mode before export/deploy

## Risks & Mitigations

- Overly noisy simulations: start with deterministic presets and bounded perturbations
- User confusion between chaos vs stress: explicit mode labels and guided onboarding
- Performance overhead on large graphs: cap scenario target breadth and use incremental rendering

## Immediate Next Steps

1. Add `stressTesting` metadata schema to `/Users/vinsanity/dev/personal/Simulark-AI/lib/schema/graph.ts`.
2. Implement `POST /api/stress-tests/plan` using `/Users/vinsanity/dev/personal/Simulark-AI/lib/stress-testing-plan.ts`.
3. Build a read-only `StressPlanPanel` showing scenarios before introducing run execution.
