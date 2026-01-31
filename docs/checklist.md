# Simulark Backend Implementation Checklist

> **Purpose** : Complete task-by-task backend implementation guide
>
> **Last Updated** : January 31, 2026
>
> **Use** : Check off each item as you complete it

---

## 📋 Phase 1: Foundation Setup

### **Project Initialization**

* [x] Initialize Next.js 14+ project with App Router
* [x] Configure TypeScript with strict mode enabled
* [x] Set up ESLint with recommended rules
* [x] Configure Prettier for code formatting
* [x] Add .gitignore for Next.js and environment files
* [x] Initialize Git repository
* [x] Create initial README.md with setup instructions
* [x] Set up package.json scripts (dev, build, start, lint, test)

### **Environment Configuration**

* [ ] Create .env.local file (add to .gitignore)
* [ ] Create .env.example file for reference
* [ ] Set up t3-env for environment variable validation
* [ ] Define server-side environment variables schema
* [ ] Define client-side environment variables schema
* [ ] Document all required environment variables
* [ ] Set up different configs for dev/staging/production
* [ ] Verify environment variables load correctly

### **Dependency Installation**

**Core Dependencies:**

* [ ] Install React 18+
* [ ] Install Next.js 14+
* [ ] Install TypeScript
* [ ] Install Tailwind CSS v4
* [ ] Install Shadcn UI components
* [ ] Install React Flow for canvas
* [ ] Install Zustand for state management

**Database & Auth:**

* [ ] Install @supabase/supabase-js
* [ ] Install @supabase/auth-helpers-nextjs
* [ ] Install @supabase/ssr

**AI & Validation:**

* [ ] Install OpenRouter SDK or fetch wrapper
* [ ] Install Valibot for schema validation
* [ ] Install zod as alternative if needed

**Utilities:**

* [ ] Install date-fns or dayjs
* [ ] Install clsx for conditional classes
* [ ] Install tailwind-merge for class merging
* [ ] Install dagre for graph layout
* [ ] Install @iconify/react for icons

**Dev Dependencies:**

* [ ] Install @types/node
* [ ] Install @types/react
* [ ] Install @types/react-dom
* [ ] Install eslint-config-next
* [ ] Install prettier
* [ ] Install typescript-eslint

### **Tailwind CSS v4 Setup**

* [ ] Initialize Tailwind configuration
* [ ] Create global.css with Tailwind directives
* [ ] Configure content paths for all components
* [ ] Set up dark mode support
* [ ] Configure custom color palette
* [ ] Add custom animations for canvas
* [ ] Test Tailwind classes render correctly
* [ ] Configure JIT mode for development

### **Folder Structure**

* [x] Create /app directory (App Router)
* [x] Create /app/api directory for API routes
* [x] Create /components directory for React components
* [x] Create /lib directory for utilities
* [x] Create /types directory for TypeScript types
* [x] Create /schemas directory for Valibot schemas
* [x] Create /hooks directory for custom hooks
* [x] Create /stores directory for Zustand stores
* [x] Create /utils directory for helper functions
* [x] Create /constants directory for app constants
* [x] Create /public directory for static assets

---

## 🔐 Phase 2: Authentication & Database

### **Supabase Project Setup**

* [ ] Create Supabase project
* [ ] Copy project URL and anon key
* [ ] Copy service role key (for server-side operations)
* [ ] Enable email authentication
* [ ] Configure OAuth providers (GitHub)
* [ ] Configure OAuth providers (Google)
* [ ] Set up redirect URLs for authentication
* [ ] Configure email templates (welcome, reset password)
* [ ] Enable Row Level Security (RLS) on all tables
* [ ] Test authentication flow in Supabase dashboard

### **Database Schema**

**Users Table (managed by Supabase Auth):**

* [ ] Verify auth.users table exists
* [ ] Create public.users table for extended user data
* [ ] Add user_id (UUID, references auth.users)
* [ ] Add email (TEXT)
* [ ] Add full_name (TEXT, nullable)
* [ ] Add avatar_url (TEXT, nullable)
* [ ] Add subscription_tier (ENUM: free, pro, enterprise)
* [ ] Add subscription_status (ENUM: active, cancelled, past_due)
* [ ] Add created_at (TIMESTAMP)
* [ ] Add updated_at (TIMESTAMP)
* [ ] Create trigger for updated_at auto-update

**Projects Table:**

* [ ] Create projects table
* [ ] Add id (UUID, primary key, default uuid_generate_v4())
* [ ] Add user_id (UUID, references public.users)
* [ ] Add name (TEXT, not null)
* [ ] Add description (TEXT, nullable)
* [ ] Add provider (ENUM: aws, gcp, azure, generic)
* [ ] Add nodes (JSONB, default '[]')
* [ ] Add edges (JSONB, default '[]')
* [ ] Add share_token (TEXT, nullable, unique)
* [ ] Add share_token_expires_at (TIMESTAMP, nullable)
* [ ] Add is_public (BOOLEAN, default false)
* [ ] Add version (INTEGER, default 1)
* [ ] Add deleted_at (TIMESTAMP, nullable)
* [ ] Add created_at (TIMESTAMP, default now())
* [ ] Add updated_at (TIMESTAMP, default now())
* [ ] Create trigger for updated_at auto-update

**Project Versions Table (for history):**

* [ ] Create project_versions table
* [ ] Add id (UUID, primary key)
* [ ] Add project_id (UUID, references projects)
* [ ] Add version (INTEGER, not null)
* [ ] Add nodes (JSONB)
* [ ] Add edges (JSONB)
* [ ] Add created_by (UUID, references public.users)
* [ ] Add created_at (TIMESTAMP)
* [ ] Add composite unique constraint on (project_id, version)

**AI Generations Table (for analytics):**

* [ ] Create ai_generations table
* [ ] Add id (UUID, primary key)
* [ ] Add user_id (UUID, references public.users)
* [ ] Add project_id (UUID, references projects, nullable)
* [ ] Add prompt (TEXT, not null)
* [ ] Add model_aggregator (TEXT)
* [ ] Add model_generator (TEXT)
* [ ] Add success (BOOLEAN, not null)
* [ ] Add error_message (TEXT, nullable)
* [ ] Add latency_ms (INTEGER)
* [ ] Add tokens_used (INTEGER, nullable)
* [ ] Add created_at (TIMESTAMP)

**User Usage Table (for rate limiting):**

* [ ] Create user_usage table
* [ ] Add user_id (UUID, primary key, references public.users)
* [ ] Add generations_this_month (INTEGER, default 0)
* [ ] Add generations_this_hour (INTEGER, default 0)
* [ ] Add last_generation_at (TIMESTAMP, nullable)
* [ ] Add month_reset_at (TIMESTAMP)
* [ ] Add hour_reset_at (TIMESTAMP)

### **Database Indexes**

* [ ] Create index on projects(user_id)
* [ ] Create index on projects(updated_at DESC)
* [ ] Create index on projects(share_token) WHERE share_token IS NOT NULL
* [ ] Create index on projects(deleted_at) WHERE deleted_at IS NULL
* [ ] Create composite index on projects(user_id, created_at DESC)
* [ ] Create index on project_versions(project_id, version DESC)
* [ ] Create index on ai_generations(user_id)
* [ ] Create index on ai_generations(created_at DESC)
* [ ] Create index on public.users(subscription_tier)
* [ ] Run EXPLAIN ANALYZE on common queries to verify indexes

### **Row Level Security (RLS) Policies**

**Projects Table:**

* [ ] Enable RLS on projects table
* [ ] Create policy: users can view their own projects
* [ ] Create policy: users can view public projects (is_public = true)
* [ ] Create policy: users can insert their own projects
* [ ] Create policy: users can update their own projects
* [ ] Create policy: users can delete their own projects (soft delete)
* [ ] Create policy: allow access via valid share_token
* [ ] Test RLS policies with different user scenarios

**Project Versions Table:**

* [ ] Enable RLS on project_versions table
* [ ] Create policy: users can view versions of their projects
* [ ] Create policy: users can insert versions for their projects
* [ ] Test version history access

**AI Generations Table:**

* [ ] Enable RLS on ai_generations table
* [ ] Create policy: users can view their own generation history
* [ ] Create policy: users can insert their own generations
* [ ] Test generation logging

**Users Table:**

* [ ] Enable RLS on public.users table
* [ ] Create policy: users can view their own profile
* [ ] Create policy: users can update their own profile
* [ ] Test user profile access

### **Database Functions & Triggers**

* [ ] Create function: update_updated_at_column()
* [ ] Create trigger: projects_updated_at (before update)
* [ ] Create trigger: users_updated_at (before update)
* [ ] Create function: increment_project_version()
* [ ] Create trigger: before_project_update (create version snapshot)
* [ ] Create function: cleanup_old_versions() (keep last 10)
* [ ] Create scheduled job: run cleanup_old_versions daily
* [ ] Create function: reset_usage_counters()
* [ ] Create scheduled job: reset monthly counters
* [ ] Create scheduled job: reset hourly counters
* [ ] Test all functions and triggers

### **Supabase Client Setup**

* [ ] Create /lib/supabase/client.ts for browser client
* [ ] Create /lib/supabase/server.ts for server client
* [ ] Create /lib/supabase/middleware.ts for auth middleware
* [ ] Implement createBrowserClient helper
* [ ] Implement createServerClient helper
* [ ] Implement getSession utility
* [ ] Implement getUser utility
* [ ] Test client initialization in different contexts

### **Authentication Implementation**

**OAuth Flow:**

* [ ] Create /app/auth/callback/route.ts for OAuth callback
* [ ] Implement code exchange for session
* [ ] Handle successful authentication redirect
* [ ] Handle authentication errors
* [ ] Create sign-in page with OAuth buttons
* [ ] Style OAuth buttons (GitHub, Google)
* [ ] Implement sign-out functionality
* [ ] Test OAuth flow end-to-end

**Session Management:**

* [ ] Implement session refresh logic
* [ ] Create auth middleware for protected routes
* [ ] Implement session timeout (24 hours)
* [ ] Create "session expired" error handling
* [ ] Test session persistence across page reloads
* [ ] Test session expiration behavior

**User Profile Sync:**

* [ ] Create database trigger: on auth.users insert
* [ ] Create corresponding public.users record
* [ ] Sync email and avatar from OAuth provider
* [ ] Create profile completion flow if needed
* [ ] Test user creation flow

---

## 🤖 Phase 3: AI Integration

### **OpenRouter Setup**

* [ ] Sign up for OpenRouter account
* [ ] Generate API key
* [ ] Add OPENROUTER_API_KEY to environment variables
* [ ] Test API connectivity with simple request
* [ ] Review rate limits and quotas
* [ ] Set up billing alerts
* [ ] Document model pricing

### **AI Service Architecture**

* [ ] Create /lib/ai directory
* [ ] Create /lib/ai/client.ts for OpenRouter client
* [ ] Create /lib/ai/prompts.ts for system prompts
* [ ] Create /lib/ai/models.ts for model configurations
* [ ] Create /lib/ai/orchestrator.ts for dual-agent logic
* [ ] Create /lib/ai/validators.ts for output validation
* [ ] Create /lib/ai/types.ts for TypeScript types

### **Model Configuration**

**Aggregator (Thinking Agent):**

* [ ] Define model: upstage/solar-pro-3:free or similar
* [ ] Create system prompt for high-level reasoning
* [ ] Define temperature setting (0.7 recommended)
* [ ] Set max tokens (2000 recommended)
* [ ] Configure retry logic (3 attempts)
* [ ] Set timeout (15 seconds)
* [ ] Test with sample prompts

**Generator (Coding Agent):**

* [ ] Define model: mistralai/devstral-2512:free or similar
* [ ] Create system prompt for JSON generation
* [ ] Define temperature setting (0.3 for consistency)
* [ ] Set max tokens (3000 recommended)
* [ ] Configure retry logic (3 attempts)
* [ ] Set timeout (15 seconds)
* [ ] Test with sample architecture plans

### **Prompt Engineering**

**Aggregator System Prompt:**

* [ ] Define role: "You are a Solutions Architect"
* [ ] Specify output format: structured bullet points
* [ ] Include component constraints (max 7 components)
* [ ] Add data flow identification requirements
* [ ] Include security considerations prompt
* [ ] Add scalability analysis requirement
* [ ] Provide 3-5 example analyses
* [ ] Include negative examples (what NOT to do)
* [ ] Test with various user prompts

**Generator System Prompt:**

* [ ] Define role: "You are a JSON compiler"
* [ ] Provide React Flow schema specification
* [ ] Include node type enums (gateway, compute, database, queue)
* [ ] Include edge protocol enums (http, grpc, queue, stream)
* [ ] Add referential integrity rules
* [ ] Specify max edges per node (3 recommended)
* [ ] Provide 3-5 example JSON outputs
* [ ] Include schema validation checklist
* [ ] Test JSON output validity

**User Prompt Augmentation:**

* [ ] Create function to inject provider context (AWS/GCP/Azure)
* [ ] Add default architectural constraints
* [ ] Include technology stack hints
* [ ] Prepend best practices for architecture type
* [ ] Test augmented prompts

### **Valibot Schema Definition**

**Node Schema:**

* [ ] Define NodeType enum (gateway, compute, database, queue, storage)
* [ ] Define Position schema (x: number, y: number)
* [ ] Define NodeData schema (label, serviceType, iconKey)
* [ ] Define Node schema (id, type, data, position)
* [ ] Add custom validators for node data
* [ ] Test schema validation with valid nodes
* [ ] Test schema validation with invalid nodes

**Edge Schema:**

* [ ] Define Protocol enum (http, grpc, queue, stream, websocket)
* [ ] Define Edge schema (id, source, target, protocol)
* [ ] Add validator: source node exists
* [ ] Add validator: target node exists
* [ ] Add validator: no self-referencing edges
* [ ] Test schema validation with valid edges
* [ ] Test schema validation with invalid edges

**Graph Schema:**

* [ ] Define Graph schema (nodes: Node[], edges: Edge[])
* [ ] Add validator: all edge endpoints exist in nodes
* [ ] Add validator: no orphaned nodes (preferred)
* [ ] Add validator: graph is connected
* [ ] Add validator: no circular dependencies (optional)
* [ ] Test complete graph validation
* [ ] Create human-readable error messages

### **Dual-Agent Orchestration**

* [ ] Create orchestrator function: generateArchitecture()
* [ ] Implement Step 1: Call Aggregator with user prompt
* [ ] Parse Aggregator response (extract architecture plan)
* [ ] Implement Step 2: Call Generator with plan + schema
* [ ] Parse Generator JSON output
* [ ] Implement Step 3: Validate with Valibot
* [ ] Handle validation failures (retry with corrections)
* [ ] Implement fallback to alternative models
* [ ] Add timeout handling (15 seconds total)
* [ ] Log all steps for debugging
* [ ] Test end-to-end generation flow

### **Error Handling & Recovery**

* [ ] Define AI error types (timeout, validation, API error)
* [ ] Implement automatic retry with exponential backoff
* [ ] Create error translation (raw → user-friendly)
* [ ] Implement schema auto-repair for common issues
* [ ] Log all AI failures to database
* [ ] Create fallback to cached successful patterns
* [ ] Test various failure scenarios
* [ ] Implement graceful degradation

### **Rate Limiting for AI**

* [ ] Create function: checkUserAIQuota()
* [ ] Query user_usage table
* [ ] Check generations_this_month against tier limit
* [ ] Check generations_this_hour against hourly limit
* [ ] Return remaining quota to user
* [ ] Implement quota exceeded error response
* [ ] Create function: incrementUserAIUsage()
* [ ] Update user_usage table after generation
* [ ] Test quota enforcement
* [ ] Test quota reset logic

---

## 🎨 Phase 4: Canvas & Layout

### **React Flow Setup**

* [x] Install @xyflow/react (React Flow v12+)
* [x] Create /components/canvas directory
* [x] Create Canvas.tsx main component
* [x] Import ReactFlow with proper types
* [x] Set up initial flow state (nodes, edges)
* [x] Implement onNodesChange handler
* [x] Implement onEdgesChange handler
* [x] Configure ReactFlow options (snapToGrid, etc.)
* [x] Test basic canvas rendering

### **Custom Node Components**

**Base Node Structure:**

* [ ] Create /components/canvas/nodes directory
* [ ] Create BaseNode.tsx component
* [ ] Implement node wrapper with Tailwind styling
* [ ] Add Iconify icon integration
* [ ] Create node header with label
* [ ] Add node body for additional info
* [ ] Implement handles (input/output connection points)
* [ ] Wrap in React.memo for performance
* [ ] Test base node rendering

**Node Types:**

* [ ] Create GatewayNode.tsx (API Gateway, Load Balancer)
* [ ] Create ComputeNode.tsx (Lambda, EC2, Cloud Function)
* [ ] Create DatabaseNode.tsx (RDS, DynamoDB, Firestore)
* [ ] Create QueueNode.tsx (SQS, Pub/Sub, RabbitMQ)
* [ ] Create StorageNode.tsx (S3, GCS, Blob Storage)
* [ ] Style each node type distinctly
* [ ] Add appropriate icons from Iconify
* [ ] Register node types with ReactFlow
* [ ] Test each node type renders correctly

**Dynamic Icon Mapping:**

* [ ] Create /lib/icons/iconMap.ts
* [ ] Define provider-specific icon mappings
* [ ] Map generic types to AWS icons
* [ ] Map generic types to GCP icons
* [ ] Map generic types to Azure icons
* [ ] Create icon resolution function
* [ ] Implement icon fallback logic
* [ ] Test icon switching when changing provider

### **Custom Edge Components**

* [ ] Create /components/canvas/edges directory
* [ ] Create SyncEdge.tsx (HTTP, gRPC)
* [ ] Create AsyncEdge.tsx (Queue, Stream)
* [ ] Style edges with protocol-specific colors
* [ ] Add edge labels (protocol name)
* [ ] Implement animated edge styles
* [ ] Create particle effects for data flow
* [ ] Register edge types with ReactFlow
* [ ] Test edge rendering and animations

### **Dagre Layout Integration**

* [ ] Install dagre and @types/dagre
* [ ] Create /lib/layout/dagre.ts
* [ ] Implement getLayoutedElements function
* [ ] Configure Dagre graph (rankdir, nodesep, ranksep)
* [ ] Convert nodes to Dagre format
* [ ] Convert edges to Dagre format
* [ ] Run Dagre layout algorithm
* [ ] Convert Dagre positions back to React Flow format
* [ ] Handle layout for different graph sizes
* [ ] Test layout with various graph structures

**Layout Optimization:**

* [ ] Move layout calculation to Web Worker
* [ ] Create /workers/layout.worker.ts
* [ ] Implement postMessage interface
* [ ] Handle worker responses
* [ ] Implement progressive layout updates
* [ ] Cache layout results
* [ ] Test worker performance improvement

### **Canvas State Management**

* [ ] Create /stores/canvasStore.ts (Zustand)
* [ ] Define state: nodes, edges, viewport
* [ ] Create action: setNodes
* [ ] Create action: setEdges
* [ ] Create action: addNode
* [ ] Create action: updateNode
* [ ] Create action: deleteNode
* [ ] Create action: addEdge
* [ ] Create action: deleteEdge
* [ ] Create action: setViewport
* [ ] Create selector: getNodeById
* [ ] Create selector: getConnectedEdges
* [ ] Test state updates

### **Canvas Performance Optimization**

* [ ] Implement React.memo on all node components
* [ ] Implement custom shouldComponentUpdate for nodes
* [ ] Use useCallback for event handlers
* [ ] Use useMemo for derived state
* [ ] Implement viewport-based rendering (only visible nodes)
* [ ] Add performance mode toggle (disable animations)
* [ ] Profile canvas with React DevTools
* [ ] Optimize re-renders (aim for < 5 per interaction)
* [ ] Test with 50, 100, 200 node graphs
* [ ] Ensure 60 FPS during pan and zoom

### **Visual Simulation**

**Particle Animation System:**

* [ ] Create /components/canvas/particles directory
* [ ] Create Particle.tsx component
* [ ] Implement SVG circle for particle
* [ ] Create CSS animation for particle movement
* [ ] Add particle spawn logic at edge start
* [ ] Calculate particle path along edge
* [ ] Implement particle lifecycle (spawn → destroy)
* [ ] Limit max particles (50 recommended)
* [ ] Test particle performance

**Protocol-Specific Animations:**

* [ ] Create animation: animate-flow-fast (solid, 2s)
* [ ] Create animation: animate-flow-slow (dashed, 5s)
* [ ] Apply animations based on edge protocol
* [ ] Create particle speed variations
* [ ] Test all protocol animations
* [ ] Ensure smooth GPU acceleration

**Node Highlighting:**

* [ ] Implement active node state
* [ ] Create highlight animation (pulse, glow)
* [ ] Trigger on simulation play
* [ ] Highlight nodes as data flows through
* [ ] Create visual queue of active nodes
* [ ] Test highlighting logic

---

## 🔌 Phase 5: API Routes

### **Project Management Endpoints**

**GET /api/projects**

* [x] Create /app/api/projects/route.ts
* [x] Implement GET handler
* [x] Get authenticated user from session
* [x] Query user's projects (exclude deleted)
* [x] Sort by updated_at DESC
* [x] Return paginated results (optional)
* [x] Handle errors (500, 401)
* [x] Test with authenticated user
* [x] Test without authentication

**POST /api/projects**

* [ ] Implement POST handler in same file
* [ ] Validate request body (name, description)
* [ ] Get authenticated user
* [ ] Create new project in database
* [ ] Return created project
* [ ] Handle errors (400, 401, 500)
* [ ] Test project creation
* [ ] Test validation errors

**GET /api/projects/[id]**

* [ ] Create /app/api/projects/[id]/route.ts
* [ ] Implement GET handler
* [ ] Get project ID from params
* [ ] Verify user owns project or project is public
* [ ] Query project from database
* [ ] Return project data
* [ ] Handle not found (404)
* [ ] Handle unauthorized (403)
* [ ] Test with owner
* [ ] Test with non-owner

**PATCH /api/projects/[id]**

* [ ] Implement PATCH handler in same file
* [ ] Validate request body
* [ ] Get project ID from params
* [ ] Verify user owns project
* [ ] Update project in database
* [ ] Increment version number
* [ ] Create version snapshot
* [ ] Return updated project
* [ ] Handle errors (400, 403, 404, 500)
* [ ] Test project updates
* [ ] Test version history creation

**DELETE /api/projects/[id]**

* [ ] Implement DELETE handler in same file
* [ ] Get project ID from params
* [ ] Verify user owns project
* [ ] Soft delete (set deleted_at timestamp)
* [ ] Return success response
* [ ] Handle errors (403, 404, 500)
* [ ] Test soft delete
* [ ] Verify project not in user's project list

### **AI Generation Endpoint**

**POST /api/generate**

* [ ] Create /app/api/generate/route.ts
* [ ] Implement POST handler
* [ ] Get authenticated user
* [ ] Check user AI quota (rate limiting)
* [ ] Validate request body (prompt, provider)
* [ ] Call dual-agent orchestrator
* [ ] Apply Dagre layout to generated graph
* [ ] Log generation to ai_generations table
* [ ] Increment user usage counter
* [ ] Return generated graph
* [ ] Handle AI errors (timeout, validation)
* [ ] Handle quota exceeded (429)
* [ ] Handle server errors (500)
* [ ] Test successful generation
* [ ] Test quota enforcement
* [ ] Test error scenarios

### **Context Bridge Endpoints**

**POST /api/projects/[id]/share**

* [ ] Create /app/api/projects/[id]/share/route.ts
* [ ] Implement POST handler
* [ ] Get project ID from params
* [ ] Verify user owns project
* [ ] Generate cryptographically secure token
* [ ] Set expiration (30 days default)
* [ ] Update project with share_token
* [ ] Return share URL
* [ ] Handle errors
* [ ] Test token generation
* [ ] Test URL format

**DELETE /api/projects/[id]/share**

* [ ] Implement DELETE handler in same file
* [ ] Verify user owns project
* [ ] Clear share_token from project
* [ ] Return success response
* [ ] Test token revocation

**GET /api/context/[token]**

* [ ] Create /app/api/context/[token]/route.ts
* [ ] Implement GET handler (public, no auth)
* [ ] Get token from params
* [ ] Query project by share_token
* [ ] Verify token not expired
* [ ] Rate limit by IP (10 req/min)
* [ ] Return architecture JSON
* [ ] Log access for analytics
* [ ] Set CORS headers (allow all origins)
* [ ] Handle not found (404)
* [ ] Handle expired token (410)
* [ ] Test valid token access
* [ ] Test expired token
* [ ] Test rate limiting

### **Export Endpoints**

**GET /api/projects/[id]/export/mermaid**

* [ ] Create /app/api/projects/[id]/export/mermaid/route.ts
* [ ] Implement GET handler
* [ ] Verify user owns project
* [ ] Parse nodes and edges
* [ ] Generate Mermaid graph TD syntax
* [ ] Return as text/plain
* [ ] Test Mermaid output validity

**GET /api/projects/[id]/export/markdown**

* [ ] Create /app/api/projects/[id]/export/markdown/route.ts
* [ ] Implement GET handler with query param (model: gemini | claude)
* [ ] Verify user owns project
* [ ] Parse architecture graph
* [ ] Generate model-specific markdown
* [ ] For Claude: use XML tags
* [ ] For Gemini: use hierarchical headers
* [ ] Return as text/markdown
* [ ] Test both formats

**GET /api/projects/[id]/export/cursorrules**

* [ ] Create /app/api/projects/[id]/export/cursorrules/route.ts
* [ ] Implement GET handler
* [ ] Verify user owns project
* [ ] Generate .cursorrules content
* [ ] Include tech stack information
* [ ] Include architecture overview
* [ ] Include best practices rules
* [ ] Return as text/plain
* [ ] Test output format

**GET /api/projects/[id]/export/pdf**

* [ ] Create /app/api/projects/[id]/export/pdf/route.ts
* [ ] Install puppeteer or similar
* [ ] Implement GET handler
* [ ] Verify user owns project
* [ ] Render canvas to HTML
* [ ] Convert to PDF
* [ ] Add watermark for free tier
* [ ] Return as application/pdf
* [ ] Set Content-Disposition header
* [ ] Test PDF generation

**GET /api/projects/[id]/export/png**

* [ ] Create /app/api/projects/[id]/export/png/route.ts
* [ ] Implement GET handler
* [ ] Verify user owns project
* [ ] Render canvas to image
* [ ] Set high resolution (2x or 3x)
* [ ] Add watermark for free tier
* [ ] Return as image/png
* [ ] Test PNG generation

### **Version History Endpoint**

**GET /api/projects/[id]/versions**

* [ ] Create /app/api/projects/[id]/versions/route.ts
* [ ] Implement GET handler
* [ ] Verify user owns project
* [ ] Query project_versions table
* [ ] Sort by version DESC
* [ ] Return version list with metadata
* [ ] Test version retrieval

**GET /api/projects/[id]/versions/[version]**

* [ ] Create /app/api/projects/[id]/versions/[version]/route.ts
* [ ] Implement GET handler
* [ ] Verify user owns project
* [ ] Query specific version
* [ ] Return version data (nodes, edges)
* [ ] Test specific version retrieval

**POST /api/projects/[id]/restore/[version]**

* [ ] Create /app/api/projects/[id]/restore/[version]/route.ts
* [ ] Implement POST handler
* [ ] Verify user owns project
* [ ] Get target version data
* [ ] Update current project with version data
* [ ] Increment version number
* [ ] Return updated project
* [ ] Test version restoration

### **User Profile Endpoint**

**GET /api/user/profile**

* [ ] Create /app/api/user/profile/route.ts
* [ ] Implement GET handler
* [ ] Get authenticated user
* [ ] Query public.users table
* [ ] Return user profile data
* [ ] Include subscription tier
* [ ] Include usage statistics
* [ ] Test profile retrieval

**PATCH /api/user/profile**

* [ ] Implement PATCH handler in same file
* [ ] Validate request body
* [ ] Get authenticated user
* [ ] Update allowed fields (full_name, avatar_url)
* [ ] Return updated profile
* [ ] Test profile updates

**GET /api/user/usage**

* [ ] Create /app/api/user/usage/route.ts
* [ ] Implement GET handler
* [ ] Get authenticated user
* [ ] Query user_usage table
* [ ] Return usage statistics
* [ ] Include remaining quota
* [ ] Test usage retrieval

---

## 🎨 Phase 6: Frontend Components

### **Layout Components**

**Main Layout:**

* [ ] Create /components/layout/Layout.tsx
* [ ] Implement responsive container
* [ ] Add header with navigation
* [ ] Add footer
* [ ] Implement dark mode toggle
* [ ] Test responsive behavior

**Header:**

* [ ] Create /components/layout/Header.tsx
* [ ] Add logo/brand
* [ ] Add navigation menu
* [ ] Add user menu (avatar, dropdown)
* [ ] Add sign out button
* [ ] Style with Tailwind
* [ ] Test responsiveness

**Sidebar:**

* [ ] Create /components/layout/Sidebar.tsx
* [ ] Add project list
* [ ] Add create new project button
* [ ] Add search/filter projects
* [ ] Implement collapsible behavior
* [ ] Test sidebar functionality

### **Authentication Components**

**Sign In Page:**

* [ ] Create /app/auth/signin/page.tsx
* [ ] Add OAuth buttons (GitHub, Google)
* [ ] Style buttons with provider colors
* [ ] Add loading states
* [ ] Handle OAuth redirect
* [ ] Test sign in flow

**Auth Callback Handler:**

* [ ] Verify /app/auth/callback/route.ts exists
* [ ] Handle successful authentication
* [ ] Redirect to dashboard
* [ ] Handle errors gracefully

### **Project Components**

**Project List:**

* [ ] Create /components/projects/ProjectList.tsx
* [ ] Fetch projects from API
* [ ] Display in grid or list view
* [ ] Add loading skeleton
* [ ] Add empty state
* [ ] Implement project search
* [ ] Add project sorting
* [ ] Test with many projects

**Project Card:**

* [ ] Create /components/projects/ProjectCard.tsx
* [ ] Display project name and description
* [ ] Show last updated timestamp
* [ ] Add provider badge
* [ ] Add action buttons (open, delete)
* [ ] Implement hover effects
* [ ] Test card interactions

**Project Create Modal:**

* [ ] Create /components/projects/CreateProjectModal.tsx
* [ ] Add form (name, description, provider)
* [ ] Implement form validation
* [ ] Call create project API
* [ ] Handle success and error states
* [ ] Close modal on success
* [ ] Test project creation flow

**Project Delete Confirmation:**

* [ ] Create /components/projects/DeleteConfirmation.tsx
* [ ] Display project name
* [ ] Add cancel and confirm buttons
* [ ] Call delete API on confirm
* [ ] Update project list on success
* [ ] Test deletion flow

### **Canvas Page Components**

**Canvas Page:**

* [ ] Create /app/projects/[id]/page.tsx
* [ ] Fetch project data
* [ ] Initialize canvas with project nodes/edges
* [ ] Render Canvas component
* [ ] Add side panels (AI assistant, properties)
* [ ] Implement auto-save
* [ ] Test page loading and rendering

**AI Assistant Panel:**

* [ ] Create /components/canvas/AIAssistantPanel.tsx
* [ ] Add prompt textarea
* [ ] Add provider selector (AWS, GCP, Azure)
* [ ] Add generate button
* [ ] Display loading state during generation
* [ ] Show error messages
* [ ] Display architecture breakdown
* [ ] Test AI generation UI

**Properties Panel:**

* [ ] Create /components/canvas/PropertiesPanel.tsx
* [ ] Display selected node properties
* [ ] Allow editing node label
* [ ] Allow editing node icon
* [ ] Implement property updates
* [ ] Test property editing

**Toolbar:**

* [ ] Create /components/canvas/Toolbar.tsx
* [ ] Add zoom controls (in, out, fit)
* [ ] Add simulation play/pause button
* [ ] Add export menu
* [ ] Add share button
* [ ] Add undo/redo buttons (optional)
* [ ] Style toolbar
* [ ] Test all toolbar actions

**Export Menu:**

* [ ] Create /components/canvas/ExportMenu.tsx
* [ ] Add export options (PDF, PNG, Mermaid, Markdown, .cursorrules)
* [ ] Implement download handlers
* [ ] Show loading states
* [ ] Handle errors
* [ ] Test all export formats

**Share Modal:**

* [ ] Create /components/canvas/ShareModal.tsx
* [ ] Display share URL
* [ ] Add copy to clipboard button
* [ ] Add expiration info
* [ ] Add revoke access button
* [ ] Test sharing flow

### **Settings Components**

**Settings Page:**

* [ ] Create /app/settings/page.tsx
* [ ] Add tabs (Profile, Subscription, Usage)
* [ ] Implement tab navigation
* [ ] Style settings page

**Profile Settings:**

* [ ] Create /components/settings/ProfileSettings.tsx
* [ ] Display current profile data
* [ ] Add edit form
* [ ] Implement profile update
* [ ] Test profile editing

**Subscription Settings:**

* [ ] Create /components/settings/SubscriptionSettings.tsx
* [ ] Display current plan
* [ ] Show plan features
* [ ] Add upgrade/downgrade buttons
* [ ] Test subscription display

**Usage Statistics:**

* [ ] Create /components/settings/UsageStats.tsx
* [ ] Display generations this month
* [ ] Show remaining quota
* [ ] Add usage chart (optional)
* [ ] Test usage display

### **UI Components (Shadcn)**

* [ ] Install Button component
* [ ] Install Input component
* [ ] Install Textarea component
* [ ] Install Select component
* [ ] Install Dialog component
* [ ] Install Dropdown Menu component
* [ ] Install Toast component
* [ ] Install Skeleton component
* [ ] Install Badge component
* [ ] Install Card component
* [ ] Customize theme colors
* [ ] Test all components

---

## 🔍 Phase 7: Testing

### **Unit Tests**

**Valibot Schema Tests:**

* [ ] Install Vitest
* [ ] Create /tests/schemas directory
* [ ] Test node schema validation
* [ ] Test edge schema validation
* [ ] Test graph schema validation
* [ ] Test custom validators
* [ ] Run tests and ensure all pass

**Utility Function Tests:**

* [ ] Create /tests/utils directory
* [ ] Test icon resolution function
* [ ] Test Dagre layout function
* [ ] Test export generators
* [ ] Run tests and ensure all pass

**API Route Tests:**

* [ ] Create /tests/api directory
* [ ] Test project CRUD endpoints
* [ ] Test AI generation endpoint
* [ ] Test export endpoints
* [ ] Mock Supabase client
* [ ] Mock OpenRouter client
* [ ] Run tests and ensure all pass

### **Integration Tests**

* [ ] Create /tests/integration directory
* [ ] Test authentication flow
* [ ] Test project creation → AI generation → export
* [ ] Test version history flow
* [ ] Test share flow
* [ ] Run integration tests

### **End-to-End Tests**

* [ ] Install Playwright
* [ ] Create /tests/e2e directory
* [ ] Test sign in flow
* [ ] Test create project flow
* [ ] Test AI generation flow
* [ ] Test canvas interactions
* [ ] Test export flow
* [ ] Test share flow
* [ ] Run E2E tests in CI

### **Performance Tests**

* [ ] Test canvas with 50 nodes
* [ ] Test canvas with 100 nodes
* [ ] Test canvas with 200 nodes
* [ ] Measure FPS during interactions
* [ ] Profile React component renders
* [ ] Identify and fix performance bottlenecks

### **Accessibility Tests**

* [ ] Run Lighthouse accessibility audit
* [ ] Test keyboard navigation
* [ ] Test screen reader compatibility
* [ ] Verify color contrast ratios
* [ ] Test with accessibility tools (axe)
* [ ] Fix all critical accessibility issues

---

## 📊 Phase 8: Analytics & Monitoring

### **Error Tracking**

* [ ] Sign up for Sentry
* [ ] Install @sentry/nextjs
* [ ] Initialize Sentry in Next.js config
* [ ] Configure source maps upload
* [ ] Add user context to errors
* [ ] Test error reporting
* [ ] Set up error alerts

### **Product Analytics**

* [ ] Sign up for PostHog (or alternative)
* [ ] Install posthog-js
* [ ] Initialize PostHog client
* [ ] Track page views
* [ ] Track user signup
* [ ] Track project creation
* [ ] Track AI generation
* [ ] Track export usage
* [ ] Track feature usage
* [ ] Create analytics dashboard

### **Performance Monitoring**

* [ ] Enable Vercel Analytics
* [ ] Add custom performance marks
* [ ] Monitor Core Web Vitals
* [ ] Set up performance alerts
* [ ] Create performance dashboard

### **Logging**

* [ ] Set up structured logging
* [ ] Log all API requests
* [ ] Log AI generations
* [ ] Log errors and warnings
* [ ] Implement log levels
* [ ] Set up log aggregation (optional)

---

## 🚀 Phase 9: Deployment

### **Vercel Setup**

* [ ] Sign up for Vercel
* [ ] Connect GitHub repository
* [ ] Configure build settings
* [ ] Add environment variables
* [ ] Configure domains
* [ ] Enable preview deployments
* [ ] Test deployment

### **Database Migration**

* [ ] Export local database schema
* [ ] Run migrations on production Supabase
* [ ] Verify all tables created
* [ ] Verify all indexes created
* [ ] Verify all RLS policies active
* [ ] Test production database connectivity

### **Environment Variables**

* [ ] Add NEXT_PUBLIC_SUPABASE_URL to Vercel
* [ ] Add NEXT_PUBLIC_SUPABASE_ANON_KEY to Vercel
* [ ] Add SUPABASE_SERVICE_KEY to Vercel
* [ ] Add OPENROUTER_API_KEY to Vercel
* [ ] Add NEXT_PUBLIC_APP_URL to Vercel
* [ ] Verify all env vars loaded correctly

### **Domain Configuration**

* [ ] Purchase domain (if needed)
* [ ] Add domain to Vercel
* [ ] Configure DNS records
* [ ] Enable SSL certificate
* [ ] Test domain access

### **CI/CD Pipeline**

* [ ] Set up GitHub Actions (optional)
* [ ] Add build workflow
* [ ] Add test workflow
* [ ] Add deployment workflow
* [ ] Test CI/CD pipeline

### **Pre-Launch Checklist**

* [ ] Run full test suite
* [ ] Perform security audit
* [ ] Test all features end-to-end
* [ ] Check all environment variables
* [ ] Verify database backups configured
* [ ] Test error handling
* [ ] Verify analytics working
* [ ] Check performance metrics
* [ ] Review accessibility
* [ ] Prepare rollback plan

---

## 📖 Phase 10: Documentation

### **API Documentation**

* [ ] Install Scalar
* [ ] Generate OpenAPI spec
* [ ] Add API descriptions
* [ ] Add request/response examples
* [ ] Add authentication docs
* [ ] Publish API docs
* [ ] Test documentation accuracy

### **User Documentation**

* [ ] Write getting started guide
* [ ] Document all features
* [ ] Add screenshots and videos
* [ ] Write FAQ
* [ ] Create troubleshooting guide
* [ ] Publish documentation site

### **Developer Documentation**

* [ ] Document architecture
* [ ] Document database schema
* [ ] Document API endpoints
* [ ] Document deployment process
* [ ] Add contribution guidelines
* [ ] Create README.md

---

## ✅ Final Verification

### **Functionality**

* [ ] All API endpoints working
* [ ] Authentication working
* [ ] Project CRUD working
* [ ] AI generation working
* [ ] Canvas rendering working
* [ ] Layout algorithm working
* [ ] Visual simulation working
* [ ] All export formats working
* [ ] Share feature working
* [ ] Version history working

### **Performance**

* [ ] Lighthouse score > 90
* [ ] Canvas 60 FPS
* [ ] API response times < 500ms (p95)
* [ ] AI generation < 8s (p95)
* [ ] No memory leaks
* [ ] Bundle size optimized

### **Security**

* [ ] Authentication secure
* [ ] RLS policies enforced
* [ ] Input validation working
* [ ] Rate limiting active
* [ ] HTTPS enabled
* [ ] Environment variables secure
* [ ] No sensitive data exposed

### **User Experience**

* [ ] Onboarding flow smooth
* [ ] Error messages clear
* [ ] Loading states implemented
* [ ] Empty states designed
* [ ] Mobile responsive
* [ ] Accessibility compliant
* [ ] Dark mode working

---

## 🎉 Launch Day

* [ ] Deploy to production
* [ ] Monitor error rates
* [ ] Monitor performance
* [ ] Monitor user signups
* [ ] Be ready for hotfixes
* [ ] Collect user feedback
* [ ] Celebrate! 🎊

---

 **Remember** : This checklist is comprehensive. Don't let it overwhelm you. Focus on one phase at a time, and check off items as you go. You've got this!

**Estimated Timeline:**

* Phase 1-2: 2-3 days (Foundation + Auth/DB)
* Phase 3-4: 3-4 days (AI + Canvas)
* Phase 5-6: 3-4 days (API + Frontend)
* Phase 7-10: 2-3 days (Testing + Deploy + Docs)

**Total: 10-14 days of focused work**
