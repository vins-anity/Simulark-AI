# Architecture Generation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make architecture generation more accurate and opinionated across modes, especially enterprise mode, while improving streaming UX, responsiveness, and frontend handling of structured architectural reasoning.

**Architecture:** The implementation adds a stricter prompt policy contract, lightweight server-side preference compatibility analysis, richer structured generation metadata, stronger enterprise-aware validation, and a more stable chat streaming/rendering experience. The backend remains tolerant of legacy responses, while the frontend progressively upgrades to consume richer metadata when available.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Bun, AI SDK streaming, Framer Motion

---

### Task 1: Add prompt policy and preference conflict rules

**Files:**
- Modify: `lib/prompt-engineering.ts`

**Step 1: Write the failing test**

Define or extend prompt-engineering tests if they exist. If no test suite exists for this module, create a focused unit test file that asserts enterprise prompts include:
- architecture-first precedence
- soft-constraint language for preferences
- primary recommendation plus preference-aligned alternative behavior

**Step 2: Run test to verify it fails**

Run: `bun test <test-file>`
Expected: FAIL because the current prompt text does not include the required policy contract.

**Step 3: Write minimal implementation**

Add:
- explicit precedence-order instructions
- enterprise-specific opinionated guidance
- structured output expectations
- conflict handling rules

Also add helper functions that summarize preferred technologies and compatibility hints for prompt assembly.

**Step 4: Run test to verify it passes**

Run: `bun test <test-file>`
Expected: PASS

**Step 5: Commit**

```bash
git add lib/prompt-engineering.ts <test-file>
git commit -m "feat: strengthen architecture generation prompt policy"
```

### Task 2: Add server-side preference compatibility analysis and structured metadata

**Files:**
- Modify: `app/api/chat/route.tsx`
- Modify: `lib/prompt-engineering.ts`
- Optional Modify: `lib/tech-normalizer.ts`

**Step 1: Write the failing test**

Create or extend a route/helper test that verifies:
- mode is normalized correctly
- enterprise requests produce preference conflict metadata when preferences clash
- the system prompt receives compatibility hints

**Step 2: Run test to verify it fails**

Run: `bun test <test-file>`
Expected: FAIL because no compatibility summary exists yet.

**Step 3: Write minimal implementation**

Add a helper that:
- normalizes selected preferences
- identifies overlap candidates and likely conflicts
- emits a concise compatibility summary for the prompt

Update the route to:
- feed compatibility summary into prompt assembly
- preserve richer metadata from the model response if present
- keep backward compatibility with existing graph extraction

**Step 4: Run test to verify it passes**

Run: `bun test <test-file>`
Expected: PASS

**Step 5: Commit**

```bash
git add app/api/chat/route.tsx lib/prompt-engineering.ts <test-file>
git commit -m "feat: add preference-aware architecture generation context"
```

### Task 3: Strengthen enterprise-aware validation and response shaping

**Files:**
- Modify: `lib/architecture-validator.ts`
- Optional Modify: `lib/architecture-quality.ts`
- Modify: `app/api/chat/route.tsx`

**Step 1: Write the failing test**

Add validator coverage for:
- missing enterprise observability/security/gateway concerns
- redundant framework combinations
- enterprise outputs with too few boundaries/components

**Step 2: Run test to verify it fails**

Run: `bun test <test-file>`
Expected: FAIL because the current validator is not strict enough on those conditions.

**Step 3: Write minimal implementation**

Extend validation rules and response shaping so the route can return:
- validation summary
- decision notes if available
- fixed graph plus validation metadata

Keep auto-fixes narrow and deterministic.

**Step 4: Run test to verify it passes**

Run: `bun test <test-file>`
Expected: PASS

**Step 5: Commit**

```bash
git add lib/architecture-validator.ts app/api/chat/route.tsx <test-file>
git commit -m "feat: tighten enterprise architecture validation"
```

### Task 4: Improve streaming UX and final assistant rendering

**Files:**
- Modify: `components/canvas/StreamingMessage.tsx`
- Modify: `components/canvas/AIAssistantPanel.tsx`

**Step 1: Write the failing test**

If component tests exist, add coverage for:
- stable stage rendering
- hiding raw JSON/noisy chunks
- rendering preference tradeoff sections when metadata is present

If no component test setup exists, document this gap and proceed with targeted manual QA.

**Step 2: Run test to verify it fails**

Run: `bun test <test-file>` or note absence of component test harness
Expected: FAIL or explicit test-gap note

**Step 3: Write minimal implementation**

Update the streaming UI to:
- map progress to architecture workflow stages
- reduce jitter and repeated parsing
- present clearer “recommended architecture” and “preference-aligned option” sections
- improve layout on narrow widths

**Step 4: Run test to verify it passes**

Run: `bun test <test-file>` if available
Expected: PASS

**Step 5: Commit**

```bash
git add components/canvas/StreamingMessage.tsx components/canvas/AIAssistantPanel.tsx <test-file>
git commit -m "feat: improve architecture chat streaming and response UX"
```

### Task 5: Verify end-to-end behavior and responsiveness

**Files:**
- No code changes required unless defects are found

**Step 1: Run static verification**

Run:

```bash
bun run lint
bun run build
```

Expected:
- lint passes
- production build succeeds

**Step 2: Start app and run browser QA**

Run the dev server and validate:
- startup mode still favors simple managed stacks
- default mode stays balanced
- enterprise mode produces best-architecture-first behavior
- conflicting user preferences produce a second alternative and clear tradeoff notes
- streaming feels stable
- mobile width remains readable and unclipped

**Step 3: Capture verification evidence**

Use Playwright interactive QA for:
- desktop happy path
- enterprise conflict scenario
- smaller viewport visual check

**Step 4: Fix any discovered issues and re-run verification**

Repeat lint/build/QA until results are stable.

**Step 5: Commit**

```bash
git add .
git commit -m "fix: finalize architecture generation accuracy and streaming UX"
```
