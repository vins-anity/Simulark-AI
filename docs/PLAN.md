# Plan: Refactor to Fullstack/Backend Design Modes

## Goal
Refactor the existing `C-LEVEL` and `TECH-LEVEL` modes into `Fullstack Design` and `Backend Design` respectively. This change will drive both the **Visual Presentation** (UI) and the **AI Generation Behavior** (Backend).

## 1. Store & Type Refactor
**File**: `lib/store.ts`
- Update `ViewMode` type:
  - `concept` -> `fullstack`
  - `implementation` -> `backend`
- Update default value to `fullstack`.

## 2. Component Updates (Frontend Specialist)
**Files**: `components/canvas/nodes/BaseNode.tsx`, `components/canvas/FlowEditor.tsx`, `app/projects/[id]/page.tsx`
- **BaseNode.tsx**:
  - mapping `fullstack` (was concept) to the "Business/Card" view.
  - mapping `backend` (was implementation) to the "Schematic/Technical" view.
  - Rename UI labels in the card headers if necessary.
- **Toggle Controls**:
  - Locate the mode toggle (likely in `ToolRail` or `WorkstationHeader` or `DashboardLayout`) and update tooltips/labels.
  - Ensure clicking the toggle switches `viewMode`.

## 3. AI Generation Refactor (Backend Specialist)
**Files**: `lib/ai-client.ts`, `app/api/generate/route.ts`, `components/canvas/AIAssistantPanel.tsx`
- **AIAssistantPanel.tsx**:
  - Pass the current `viewMode` (Fullstack/Backend) to the API as `designMode`.
  - Retain `chatMode` (Startup/Corporate) as `styleMode` or `persona`.
- **lib/ai-client.ts**:
  - Update `generateArchitectureStream` to accept `designMode`.
  *   **Fullstack Prompt**: "Generate a complete end-to-end stack (Frontend, Backend, DB, Cloud). intelligently select the best tech match (e.g., Python Scraper -> FastAPI + Python DB). List alternatives in reasoning."
  *   **Backend Prompt**: "Focus on modern backend architecture, cloud-native (AWS/GCP), APIs, data flow, DB scaling, and automation (n8n). Ignore frontend details."

## 4. Tech Ecosystem Update (Database/Frontend Specialist)
**File**: `lib/tech-ecosystem.ts`
- Add new AI Node types/icons:
  - `gemini` (Google)
  - `llama` (Meta)
  - `deepseek` (DeepSeek)
  - `claude` (Anthropic) - *Update existing if needed*
  - `mistral` (Mistral AI)
- Ensure they have `category: 'ai'` and `defaultType: 'ai'`.

## 5. Verification
- **Manual**:
  - Check toggle switches modes visually.
  - Switch to "Fullstack Design" -> Generate "A scraping bot" -> Expect Python/FastAPI/DB stack.
  - Switch to "Backend Design" -> Generate "High scale event system" -> Expect Kafka/Redis/K8s focus.
  - Add an "AI" node and check if new logos (Gemini, Llama) are available in the dropdown.

## Agents Involved
1. `project-planner` (Orchestrator)
2. `frontend-specialist` (UI/Redux Refactor)
3. `backend-specialist` (AI Prompts)
