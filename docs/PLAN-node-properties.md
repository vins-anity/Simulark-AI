# PLAN-node-properties

> **Goal**: Enhance Simulark's node system with comprehensive node properties, a rich tech ecosystem registry, and expanded node types (Storage, Gateway, Mobile, etc.) with correct official logos.

## 1. Tech Ecosystem Registry
We will create `lib/tech-ecosystem.ts` to power the tech selector and logo resolution.

### Data Model
```typescript
export type TechCategory = 'frontend' | 'backend' | 'database' | 'cloud' | 'devops' | 'ai' | 'tooling';

export interface TechItem {
  id: string;          // e.g., 'nextjs'
  label: string;       // e.g., 'Next.js'
  icon: string;        // Iconify ID, e.g., 'logos:nextjs-icon'
  category: TechCategory;
  defaultType?: NodeType; // Suggested node type
}
```

### Initial Registry Content (Sample)
The registry will contain 50+ items including:
- **Frontend**: React, Vue, Angular, Svelte, Next.js, Remix, Vite, Tailwind.
- **Backend**: Node.js, Python, Go, Rust, Java, Bun, Deno, Express, NestJS.
- **Database**: Postgres, MySQL, MongoDB, Redis, Cassandra, DynamoDB, Supabase, Firebase.
- **Cloud**: AWS, Google Cloud, Azure, Vercel, Netlify, Heroku, DigitalOcean, Cloudflare.
- **DevOps**: Docker, Kubernetes, Terraform, Ansible, GitHub Actions, Jenkins, Prometheus, Grafana.
- **AI**: OpenAI, Anthropic, HuggingFace, LangChain, Pinecone.

## 2. Expanded Node Types & Components
We will add new node types to `components/canvas/nodes/` and register them in `FlowEditor.tsx`.

| Node Type | Component | Icon | Usage |
|-----------|-----------|------|-------|
| **Client** | `ClientNode.tsx` | `lucide:monitor` | Browsers, Mobile Apps, CLI |
| **Function** | `FunctionNode.tsx` | `lucide:zap` | Lambda, Cloud Run, Edge Functions |
| **Storage** | `StorageNode.tsx` | `lucide:hard-drive` | S3 Buckets, CDNs, File Systems |
| **AI** | `AINode.tsx` | `lucide:bot` | LLM Models, Agents, Vector DBs |

**Note**: Existing types (`Service`, `Database`, `Queue`, `Gateway`) will remain but be enhanced.

## 3. Dynamic Node Properties Schema
The `NodeProperties` panel will dynamically render fields based on the `data.type` or `data.tech`.

### General Properties (All Nodes)
- `Label` (string)
- `Description` (textarea)
- `Tags` (string[])

### Type-Specific Properties
#### Service (Container/Server)
- `Language`: (e.g., Node.js, Python)
- `Framework`: (e.g., Express, Django)
- `Port`: (number, e.g., 3000)
- `Replicas`: (number, min/max)
- `Health Check`: (path string)

#### Database (RDS/NoSQL)
- `Engine`: (Postgres, MySQL, etc.)
- `Version`: (string, e.g., "15.2")
- `Instance Size`: (e.g., "db.t3.micro")
- `Storage`: (GB)
- `Multi-AZ`: (boolean)

#### Function (Serverless)
- `Runtime`: (e.g., nodejs18.x, python3.9)
- `Memory`: (MB, slider 128-10240)
- `Timeout`: (seconds, slider 1-900)
- `Env Variables`: (key-value list)

#### Queue / Event Bus
- `Type`: (FIFO / Standard)
- `Retention`: (days)
- `Visibility Timeout`: (seconds)

#### Storage (Bucket/CDN)
- `Access`: (Public / Private)
- `Versioning`: (boolean)
- `Encryption`: (boolean)

## 4. UI Implementation Details

### Tech Selector (`TechCombobox`)
- Uses `cmdk` (via shadcn/ui) for searchable dropdown.
- Displays Tech Icon + Label + Category badge.
- **Grouped by Category** for easier browsing.

### Properties Panel (`NodeProperties.tsx`)
- **Header**: Editable Label + Tech Icon (clickable to change).
- **Tabs**:
    - **General**: Core metadata (Label, Desc, Tags).
    - **Config**: Type-specific fields (Memory, Port, etc.).
    - **Style**: (Future) Color overrides.
- **Field Rendering**:
    - Use a `PropertyField` component that handles different input types (Text, Number, Slider, Switch, KeyValue).

## 5. Implementation Steps

### Phase 1: Registry & Types
1.  Create `lib/tech-ecosystem.ts` with full data.
2.  Update `lib/types.ts` with new `NodeType` union.
3.  Enhance `lib/icons.ts` to fallback to `TECH_ECOSYSTEM`.

### Phase 2: Node Components
1.  Create `ClientNode.tsx`, `FunctionNode.tsx`, `StorageNode.tsx`, `AINode.tsx`.
    -   *Design*: distinct visualization (e.g., Cylinder for Storage, Hexagon for Function?).
2.  Register in `nodeTypes`.

### Phase 3: Properties Panel
1.  Install `cmdk` (if not present).
2.  Build `TechCombobox` component.
3.  Refactor `NodeProperties.tsx` to use a schema-based rendering approach.
    -   Define `NODE_SCHEMAS` constant mapping types to fields.
    -   Render fields dynamically.
4.  Add `Function`, `Storage`, `Database` specific schemas.

## Verification
- [ ] **Manual**: Select a node -> Open Panel -> Change Tech to "Next.js" -> Icon updates.
- [ ] **Manual**: Change Node Type to "Function" -> Panel shows "Memory" slider.
- [ ] **Manual**: Change Node Type to "Storage" -> Panel shows "Versioning" switch.
- [ ] **Manual**: Verify "Mobile" node renders with correct smartphone icon.
