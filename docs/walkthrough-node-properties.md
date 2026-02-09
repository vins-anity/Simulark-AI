# Enhanced Node Properties & Tech Ecosystem

This update introduces a comprehensive system for managing node properties, a rich technology registry, and new specialized node types.

## 1. Tech Ecosystem Registry
A new central registry (`lib/tech-ecosystem.ts`) defines over 50 technologies across categories like Frontend, Backend, Database, Cloud, and AI. This powers:
- **Consistent Icons:** All nodes now use high-quality icons from the registry.
- **Smart Defaults:** Selecting a tech automatically applies appropriate defaults (e.g., "Postgres" -> Database type).
- **Searchable Selection:** A new `TechCombobox` allows finding technologies easily.

## 2. New Node Types
We've added 4 new specialized node types to the canvas:

### `ClientNode` (`client`)
- **Use Case:** Frontend apps, SPAs, Mobile apps.
- **Visuals:** Purple accent, Monitor/Smartphone icon.
- **Properties:** Platform (Web/Mobile), Framework, Daily Users.

### `FunctionNode` (`function`)
- **Use Case:** Serverless functions (Lambda, Vercel Fn).
- **Visuals:** Yellow accent, Zap icon.
- **Properties:** Runtime (Node/Python), Memory, Timeout.

### `StorageNode` (`storage`)
- **Use Case:** Object storage (S3), Buckets.
- **Visuals:** Emerald accent, HardDrive icon.
- **Properties:** Class (Standard/Glacier), Encryption, Public Access.

### `AINode` (`ai`)
- **Use Case:** LLMs, Inference endpoints.
- **Visuals:** Pink/Purple accent, Bot icon.
- **Properties:** Model, Context Window, Temperature.

## 3. Dynamic Properties Panel
The `NodeProperties` panel has been completely overhauled:
- **Integrated:** Now renders directly within the `FlowEditor` when a node is selected.
- **Tech Selector:** Uses the new searchable `TechCombobox`.
- **Dynamic Forms:** Automatically shows relevant configuration fields based on the node type (e.g., "Visibility Timeout" for Queues, "Replicas" for Services).
- **Real-time Updates:** Changes are immediately reflected in the node data and visuals.

## How to Test
1.  Open a project in the editor.
2.  Select any node.
3.  The **Node Properties** panel will appear on the top right.
4.  Try changing the **Technology** using the search.
5.  Adjust specific configuration fields (e.g., change `Runtime` for a Function node).
6.  Observe the node icon and label updating on the canvas.
