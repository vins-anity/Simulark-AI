import { Icon } from "@iconify/react";

/**
 * Maps technology names to Iconify icon strings.
 * Based on 'Supported Technology Ecosystem' in docs/add-features.md.
 */
export const TECH_ICONS: Record<string, string> = {
    // Runtimes & Languages
    "Node.js": "logos:nodejs-icon",
    "Bun": "logos:bun",
    "Deno": "logos:deno",
    "Go": "logos:go",
    "Rust": "logos:rust",
    "Python": "logos:python",
    "Java": "logos:java",
    "Kotlin": "logos:kotlin-icon",
    "C#": "logos:c-sharp",
    "Ruby": "logos:ruby",
    "PHP": "logos:php",
    "Lua": "logos:lua",

    // Frameworks
    "Next.js": "logos:nextjs-icon",
    "React": "logos:react",
    "Vue": "logos:vue",
    "Svelte": "logos:svelte-icon",
    "Angular": "logos:angular-icon",
    "NestJS": "logos:nestjs",
    "Express.js": "skill-icons:expressjs-light",
    "Fastify": "logos:fastify-icon",
    "Hono": "logos:hono",
    "ElysiaJS": "logos:elysia", // Check if available, or generic
    "Django": "logos:django-icon",
    "Flask": "logos:flask",
    "FastAPI": "logos:fastapi-icon",
    "Spring Boot": "logos:spring-icon",
    "Laravel": "logos:laravel",
    "Symfony": "logos:symfony",

    // Cloud & Hosting
    "AWS": "logos:aws",
    "GCP": "logos:google-cloud",
    "Azure": "logos:azure-icon",
    "Vercel": "logos:vercel-icon",
    "Netlify": "logos:netlify",
    "Heroku": "logos:heroku-icon",
    "Supabase": "logos:supabase-icon",
    "Firebase": "logos:firebase",
    "Cloudflare": "logos:cloudflare",
    "DigitalOcean": "logos:digital-ocean-icon",
    "Docker": "logos:docker-icon",
    "Kubernetes": "logos:kubernetes",
    "Terraform": "logos:terraform-icon",

    // Databases
    "PostgreSQL": "logos:postgresql",
    "MySQL": "logos:mysql",
    "MongoDB": "logos:mongodb-icon",
    "Redis": "logos:redis",
    "SQLite": "logos:sqlite",
    "Cassandra": "logos:cassandra-icon",
    "Elasticsearch": "logos:elasticsearch",
    "DynamoDB": "logos:aws-dynamodb",
    "MariaDB": "logos:mariadb-icon",
    "Neo4j": "logos:neo4j",
    "Qdrant": "simple-icons:qdrant",
    "Pinecone": "logos:pinecone",

    // Messaging
    "Kafka": "logos:kafka-icon",
    "RabbitMQ": "logos:rabbitmq-icon",
    "SQS": "logos:aws-sqs",
    "SNS": "logos:aws-sns",
    "Pub/Sub": "logos:google-cloud-pub-sub",
};

/**
 * Returns the icon string for a given tech name.
 * Falls back to a generic icon if not found.
 */
export function getTechIcon(tech: string | undefined): string | null {
    if (!tech) return null;
    return TECH_ICONS[tech] || null;
}
