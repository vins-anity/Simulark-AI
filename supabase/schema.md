# Database Schema Design

This document defines the data models for the Simulark AI application using Supabase (PostgreSQL).

---

## 1. users table

Stores the state of every user.

- `id` (PK): Unique Identifier (UUID)
- `email`: Email address (TEXT, UNIQUE)
- `subscription_tier` (FK): References subscription_tiers(name)
- `preferences`: User-specific settings (JSONB)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp
- `last_sign_in_at`: Last sign-in time
- `is_active`: Account active status (BOOLEAN)

---

## 2. subscription_tiers table

Defines available subscription tiers.

- `id` (PK): Unique identifier (SERIAL)
- `name`: Tier name (TEXT - free, pro, enterprise)
- `display_name`: Display name
- `price_monthly`: Monthly price (DECIMAL)
- `price_yearly`: Yearly price (DECIMAL)
- `features`: Tier features list (JSONB)
- `limits`: Usage limits (JSONB)
- `is_active`: Tier availability

---

## 3. projects table

Stores project data for users.

- `id` (PK): Unique identifier (UUID)
- `user_id` (FK): References users(id)
- `name`: Project name
- `description`: Project description
- `status`: Project status (draft, active, archived)
- `settings`: Project-specific settings (JSONB)
- `is_public`: Public visibility (BOOLEAN)
- `version`: Project version (INTEGER)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

---

## 4. graphs table

Stores graph/flow configurations for projects.

- `id` (PK): Unique identifier (UUID)
- `project_id` (FK): References projects(id)
- `name`: Graph name
- `nodes`: Graph nodes array (JSONB)
- `edges`: Graph edges array (JSONB)
- `viewport`: Viewport settings (JSONB)
- `is_valid`: Validation status (BOOLEAN)
- `version`: Graph version (INTEGER)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

---

## 5. nodes table

Individual nodes within a graph.

- `id` (PK): Unique identifier (UUID)
- `graph_id` (FK): References graphs(id)
- `type`: Node type (service, database, etc.)
- `label`: Display label
- `position`: Position {x, y} (JSONB)
- `data`: Node-specific data (JSONB)
- `style`: Visual styling (JSONB)
- `width`: Node width
- `height`: Node height
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

---

## 6. edges table

Connections between nodes.

- `id` (PK): Unique identifier (UUID)
- `graph_id` (FK): References graphs(id)
- `source_node_id` (FK): References nodes(id)
- `target_node_id` (FK): References nodes(id)
- `source_handle`: Source handle identifier
- `target_handle`: Target handle identifier
- `type`: Edge type (TEXT)
- `data`: Edge-specific data (JSONB)
- `label`: Edge label
- `created_at`: Creation timestamp

---

## 7. chats table

Stores chat sessions.

- `id` (PK): Unique identifier (UUID)
- `project_id` (FK): References projects(id)
- `user_id` (FK): References users(id)
- `title`: Chat session title
- `context`: Chat context data (JSONB)
- `messages`: Chat messages array (JSONB)
- `is_archived`: Archival status (BOOLEAN)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

---

## 8. messages table

Individual messages in chat sessions.

- `id` (PK): Unique identifier (UUID)
- `chat_id` (FK): References chats(id)
- `role`: Message role (user, assistant, system)
- `content`: Message content
- `metadata`: Additional metadata (JSONB)
- `tokens`: Token count
- `created_at`: Creation timestamp

---

## 9. contexts table

Stores reusable context configurations.

- `id` (PK): Unique identifier (UUID)
- `user_id` (FK): References users(id)
- `name`: Context name
- `description`: Context description
- `content`: Context content
- `type`: Context type (text, json, yaml)
- `tags`: Context tags (TEXT[])
- `is_public`: Public visibility (BOOLEAN)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

---

## 10. templates table

Stores reusable project templates.

- `id` (PK): Unique identifier (UUID)
- `name`: Template name
- `description`: Template description
- `category`: Template category
- `graph_data`: Template graph data (JSONB)
- `thumbnail_url`: Template preview image
- `is_premium`: Premium template flag (BOOLEAN)
- `usage_count`: Usage counter
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

---

## 11. api_keys table

Stores user API keys for external services.

- `id` (PK): Unique identifier (UUID)
- `user_id` (FK): References users(id)
- `name`: Key name/identifier
- `provider`: AI provider name
- `api_key_encrypted`: Encrypted API key
- `is_active`: Key active status (BOOLEAN)
- `last_used_at`: Last usage timestamp
- `expires_at`: Optional expiration
- `created_at`: Creation timestamp

---

## 12. audit_logs table

Tracks user actions for security and analytics.

- `id` (PK): Unique identifier (UUID)
- `user_id` (FK): References users(id)
- `action`: Action type
- `resource_type`: Resource type
- `resource_id`: Resource identifier
- `details`: Action details (JSONB)
- `ip_address`: Client IP address
- `user_agent`: Client user agent
- `created_at`: Creation timestamp

---

## 13. usage_analytics table

Tracks feature usage for limits and billing.

- `id` (PK): Unique identifier (UUID)
- `user_id` (FK): References users(id)
- `metric_type`: Metric type
- `count`: Usage count (INTEGER)
- `period_start`: Period start timestamp
- `period_end`: Period end timestamp
- `created_at`: Creation timestamp

---

## Relationships

- users → projects → graphs → nodes → edges
- users → chats → messages
- users → contexts
- users → api_keys
- users → usage_analytics
- users → subscription_tiers
- projects → chats
- projects → graphs
- graphs → nodes
- graphs → edges

---

## Indexes Summary

| Table           | Indexes                                  |
| --------------- | ---------------------------------------- |
| users           | email, subscription_tier                 |
| projects        | user_id, status, created_at              |
| graphs          | project_id                               |
| nodes           | graph_id, type                           |
| edges           | graph_id, source_node_id, target_node_id |
| chats           | project_id, user_id, created_at          |
| messages        | chat_id, created_at                      |
| contexts        | user_id, type, tags (GIN)                |
| templates       | category, is_premium                     |
| api_keys        | user_id, provider                        |
| audit_logs      | user_id, action, created_at              |
| usage_analytics | user_id, metric_type, period             |
