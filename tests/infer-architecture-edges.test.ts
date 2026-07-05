import { describe, expect, it } from "vitest";
import { ensureArchitectureEdges } from "@/lib/infer-architecture-edges";

describe("ensureArchitectureEdges", () => {
  it("infers a star topology for a typical SaaS stack with 0 model edges", () => {
    const nodes = [
      {
        id: "waf",
        type: "gateway",
        data: { label: "Cloudflare WAF", tech: "cloudflare" },
      },
      {
        id: "app",
        type: "frontend",
        data: { label: "Next.js", tech: "nextjs" },
      },
      {
        id: "auth",
        type: "auth",
        data: { label: "Supabase Auth", tech: "supabase-auth" },
      },
      {
        id: "db",
        type: "database",
        data: { label: "Supabase Database", tech: "supabase" },
      },
      {
        id: "cache",
        type: "cache",
        data: { label: "Upstash Redis", tech: "upstash-redis" },
      },
      {
        id: "queue",
        type: "queue",
        data: { label: "Upstash QStash", tech: "upstash-qstash" },
      },
      {
        id: "pay",
        type: "payment",
        data: { label: "Stripe", tech: "stripe" },
      },
      {
        id: "email",
        type: "messaging",
        data: { label: "SendGrid", tech: "sendgrid" },
      },
      {
        id: "apm",
        type: "monitoring",
        data: { label: "Datadog APM", tech: "datadog" },
      },
    ];

    const result = ensureArchitectureEdges(nodes, []);

    expect(result.inferred).toBe(true);
    expect(result.edges.length).toBeGreaterThanOrEqual(8);
    expect(result.edges.some((e) => e.source === "waf" && e.target === "app")).toBe(
      true,
    );
    expect(result.edges.some((e) => e.source === "app" && e.target === "db")).toBe(
      true,
    );
  });

  it("does not replace valid edges from the model", () => {
    const nodes = [
      { id: "a", type: "frontend", data: { label: "A", tech: "nextjs" } },
      { id: "b", type: "database", data: { label: "B", tech: "supabase" } },
    ];
    const edges = [
      {
        id: "e1",
        source: "a",
        target: "b",
        data: { protocol: "database", label: "Queries" },
      },
    ];

    const result = ensureArchitectureEdges(nodes, edges);

    expect(result.inferred).toBe(false);
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]?.id).toBe("e1");
  });

  it("supplements edges when only a few connections exist", () => {
    const nodes = [
      {
        id: "waf",
        type: "gateway",
        data: { label: "Cloudflare WAF", tech: "cloudflare" },
      },
      {
        id: "app",
        type: "frontend",
        data: { label: "Next.js", tech: "nextjs" },
      },
      {
        id: "auth",
        type: "auth",
        data: { label: "Supabase Auth", tech: "supabase-auth" },
      },
      {
        id: "db",
        type: "database",
        data: { label: "Supabase Database", tech: "supabase" },
      },
      {
        id: "cache",
        type: "cache",
        data: { label: "Upstash Redis", tech: "upstash-redis" },
      },
    ];
    const edges = [
      {
        id: "e1",
        source: "waf",
        target: "app",
        data: { protocol: "https", label: "Ingress" },
      },
    ];

    const result = ensureArchitectureEdges(nodes, edges);

    expect(result.inferred).toBe(true);
    expect(result.edges.length).toBeGreaterThanOrEqual(4);
    expect(result.edges.some((e) => e.id === "e1")).toBe(true);
    expect(result.edges.some((e) => e.source === "app" && e.target === "db")).toBe(
      true,
    );
  });
});
