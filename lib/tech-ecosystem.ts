export type TechCategory = 'frontend' | 'backend' | 'database' | 'cloud' | 'devops' | 'ai' | 'tooling' | 'storage' | 'compute';

export interface TechItem {
    id: string;          // e.g., 'nextjs'
    label: string;       // e.g., 'Next.js'
    icon: string;        // Iconify ID, e.g., 'logos:nextjs-icon'
    category: TechCategory;
    defaultType?: string; // Suggested node type (e.g., 'service', 'database')
}

export const TECH_ECOSYSTEM: TechItem[] = [
    // Frontend
    { id: 'react', label: 'React', icon: 'logos:react', category: 'frontend', defaultType: 'frontend' },
    { id: 'vue', label: 'Vue.js', icon: 'logos:vue', category: 'frontend', defaultType: 'frontend' },
    { id: 'angular', label: 'Angular', icon: 'logos:angular-icon', category: 'frontend', defaultType: 'frontend' },
    { id: 'svelte', label: 'Svelte', icon: 'logos:svelte-icon', category: 'frontend', defaultType: 'frontend' },
    { id: 'nextjs', label: 'Next.js', icon: 'logos:nextjs-icon', category: 'frontend', defaultType: 'frontend' },
    { id: 'remix', label: 'Remix', icon: 'logos:remix-icon', category: 'frontend', defaultType: 'frontend' },
    { id: 'vite', label: 'Vite', icon: 'logos:vitejs', category: 'frontend', defaultType: 'frontend' },
    { id: 'astro', label: 'Astro', icon: 'logos:astro', category: 'frontend', defaultType: 'frontend' },
    { id: 'flutter', label: 'Flutter', icon: 'logos:flutter', category: 'frontend', defaultType: 'client' },
    { id: 'react-native', label: 'React Native', icon: 'logos:react', category: 'frontend', defaultType: 'client' },

    // Backend
    { id: 'nodejs', label: 'Node.js', icon: 'logos:nodejs-icon', category: 'backend', defaultType: 'backend' },
    { id: 'python', label: 'Python', icon: 'logos:python', category: 'backend', defaultType: 'backend' },
    { id: 'go', label: 'Go', icon: 'logos:go', category: 'backend', defaultType: 'backend' },
    { id: 'rust', label: 'Rust', icon: 'logos:rust', category: 'backend', defaultType: 'backend' },
    { id: 'java', label: 'Java', icon: 'logos:java', category: 'backend', defaultType: 'backend' },
    { id: 'bun', label: 'Bun', icon: 'logos:bun', category: 'backend', defaultType: 'backend' },
    { id: 'deno', label: 'Deno', icon: 'logos:deno', category: 'backend', defaultType: 'backend' },
    { id: 'express', label: 'Express', icon: 'logos:express', category: 'backend', defaultType: 'backend' },
    { id: 'nestjs', label: 'NestJS', icon: 'logos:nestjs', category: 'backend', defaultType: 'backend' },
    { id: 'fastapi', label: 'FastAPI', icon: 'logos:fastapi-icon', category: 'backend', defaultType: 'backend' },
    { id: 'django', label: 'Django', icon: 'logos:django-icon', category: 'backend', defaultType: 'backend' },
    { id: 'spring', label: 'Spring Boot', icon: 'logos:spring-icon', category: 'backend', defaultType: 'backend' },

    // Database
    { id: 'postgres', label: 'PostgreSQL', icon: 'logos:postgresql', category: 'database', defaultType: 'database' },
    { id: 'mysql', label: 'MySQL', icon: 'logos:mysql-icon', category: 'database', defaultType: 'database' },
    { id: 'mongodb', label: 'MongoDB', icon: 'logos:mongodb-icon', category: 'database', defaultType: 'database' },
    { id: 'redis', label: 'Redis', icon: 'logos:redis', category: 'database', defaultType: 'database' },
    { id: 'cassandra', label: 'Cassandra', icon: 'logos:cassandra', category: 'database', defaultType: 'database' },
    { id: 'elasticsearch', label: 'Elasticsearch', icon: 'logos:elasticsearch', category: 'database', defaultType: 'database' },
    { id: 'dynamodb', label: 'DynamoDB', icon: 'logos:aws-dynamodb', category: 'database', defaultType: 'database' },
    { id: 'supabase', label: 'Supabase', icon: 'logos:supabase-icon', category: 'database', defaultType: 'database' },
    { id: 'firebase', label: 'Firebase', icon: 'logos:firebase', category: 'database', defaultType: 'database' },
    { id: 'planetscale', label: 'PlanetScale', icon: 'logos:planetscale', category: 'database', defaultType: 'database' },
    { id: 'neon', label: 'Neon', icon: 'logos:neon-icon', category: 'database', defaultType: 'database' },

    // Cloud & Compute
    { id: 'aws', label: 'AWS', icon: 'logos:aws', category: 'cloud', defaultType: 'service' },
    { id: 'gcp', label: 'Google Cloud', icon: 'logos:google-cloud', category: 'cloud', defaultType: 'service' },
    { id: 'azure', label: 'Azure', icon: 'logos:microsoft-azure', category: 'cloud', defaultType: 'service' },
    { id: 'vercel', label: 'Vercel', icon: 'logos:vercel-icon', category: 'cloud', defaultType: 'service' },
    { id: 'netlify', label: 'Netlify', icon: 'logos:netlify-icon', category: 'cloud', defaultType: 'service' },
    { id: 'heroku', label: 'Heroku', icon: 'logos:heroku-icon', category: 'cloud', defaultType: 'service' },
    { id: 'digitalocean', label: 'DigitalOcean', icon: 'logos:digital-ocean', category: 'cloud', defaultType: 'service' },
    { id: 'flyio', label: 'Fly.io', icon: 'logos:fly-icon', category: 'cloud', defaultType: 'service' },
    { id: 'cloudflare', label: 'Cloudflare', icon: 'logos:cloudflare-icon', category: 'cloud', defaultType: 'service' },

    // Functions / Serverless
    { id: 'lambda', label: 'AWS Lambda', icon: 'logos:aws-lambda', category: 'compute', defaultType: 'function' },
    { id: 'cloud-run', label: 'Cloud Run', icon: 'logos:google-cloud-run', category: 'compute', defaultType: 'function' },
    { id: 'azure-functions', label: 'Azure Functions', icon: 'logos:azure-functions', category: 'compute', defaultType: 'function' },
    { id: 'workers', label: 'Cloudflare Workers', icon: 'logos:cloudflare-workers-icon', category: 'compute', defaultType: 'function' },

    // Storage
    { id: 's3', label: 'Amazon S3', icon: 'logos:aws-s3', category: 'storage', defaultType: 'storage' },
    { id: 'gcs', label: 'Google Cloud Storage', icon: 'logos:google-cloud-storage', category: 'storage', defaultType: 'storage' },
    { id: 'r2', label: 'Cloudflare R2', icon: 'logos:cloudflare-r2', category: 'storage', defaultType: 'storage' },

    // AI
    { id: 'openai', label: 'OpenAI', icon: 'logos:openai-icon', category: 'ai', defaultType: 'ai' },
    { id: 'anthropic', label: 'Anthropic', icon: 'logos:anthropic-icon', category: 'ai', defaultType: 'ai' },
    { id: 'huggingface', label: 'Hugging Face', icon: 'logos:hugging-face-icon', category: 'ai', defaultType: 'ai' },
    { id: 'pinecone', label: 'Pinecone', icon: 'logos:pinecone', category: 'ai', defaultType: 'ai' },
    { id: 'langchain', label: 'LangChain', icon: 'logos:langchain-icon', category: 'ai', defaultType: 'ai' },
    { id: 'google-gemini', label: 'Google Gemini', icon: 'logos:google-gemini', category: 'ai', defaultType: 'ai' },
    { id: 'meta-llama', label: 'Meta Llama', icon: 'logos:meta-icon', category: 'ai', defaultType: 'ai' },
    { id: 'deepseek', label: 'DeepSeek', icon: 'arcticons:deepseek', category: 'ai', defaultType: 'ai' },
    { id: 'mistral', label: 'Mistral AI', icon: 'logos:mistral-icon', category: 'ai', defaultType: 'ai' },

    // DevOps & Tooling
    { id: 'docker', label: 'Docker', icon: 'logos:docker-icon', category: 'devops', defaultType: 'service' },
    { id: 'kubernetes', label: 'Kubernetes', icon: 'logos:kubernetes', category: 'devops', defaultType: 'service' },
    { id: 'terraform', label: 'Terraform', icon: 'logos:terraform-icon', category: 'devops', defaultType: 'service' },
    { id: 'github-actions', label: 'GitHub Actions', icon: 'logos:github-actions', category: 'devops', defaultType: 'service' },
    { id: 'jenkins', label: 'Jenkins', icon: 'logos:jenkins', category: 'devops', defaultType: 'service' },
    { id: 'prometheus', label: 'Prometheus', icon: 'logos:prometheus', category: 'devops', defaultType: 'service' },
    { id: 'grafana', label: 'Grafana', icon: 'logos:grafana', category: 'devops', defaultType: 'service' },
    { id: 'nginx', label: 'Nginx', icon: 'logos:nginx', category: 'devops', defaultType: 'gateway' },

    // Queues
    { id: 'kafka', label: 'Kafka', icon: 'logos:kafka-icon', category: 'backend', defaultType: 'queue' },
    { id: 'rabbitmq', label: 'RabbitMQ', icon: 'logos:rabbitmq-icon', category: 'backend', defaultType: 'queue' },
    { id: 'sqs', label: 'AWS SQS', icon: 'logos:aws-sqs', category: 'backend', defaultType: 'queue' },
];

export function getTechItem(id: string): TechItem | undefined {
    return TECH_ECOSYSTEM.find(item => item.id === id);
}

export function getTechIconFromRegistry(id: string): string | undefined {
    return TECH_ECOSYSTEM.find(item => item.id === id || item.label.toLowerCase() === id.toLowerCase())?.icon;
}
