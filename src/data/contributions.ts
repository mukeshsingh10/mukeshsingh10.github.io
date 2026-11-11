export interface ProjectItem {
  project: string;
  category: string;
  description: string;
  tag: string;
  url: string;
  noteUrl?: string;
  featured?: boolean;
}

export const projects: ProjectItem[] = [
  {
    project: "Miniflux Sync",
    category: "Go / RSS Tools",
    description: "Automated synchronization utility for Miniflux RSS feeds with offline caching and webhook notification triggers.",
    tag: "Go / Open Source",
    url: "https://github.com/mukeshsingh10",
    featured: true,
  },
  {
    project: "API Design Patterns",
    category: "Architecture & Systems",
    description: "Production guidelines, idempotency conventions, and rate-limiting patterns for resilient REST and RPC services.",
    tag: "Design / Patterns",
    url: "https://github.com/mukeshsingh10",
    noteUrl: "/notes/good-api-design/",
    featured: true,
  },
  {
    project: "Distributed Caching",
    category: "Backend Infrastructure",
    description: "Multi-tiered caching library exploring cache invalidation strategies, stampede prevention, and Redis clustering.",
    tag: "Systems / Cache",
    url: "https://github.com/mukeshsingh10",
    featured: true,
  },
  {
    project: "Go Concurrency Toolkit",
    category: "Concurrency & Primitives",
    description: "Clean patterns for worker pools, bounded fan-out/fan-in pipelines, and safe context-cancellation handling in Go.",
    tag: "Go / Concurrency",
    url: "https://github.com/mukeshsingh10",
    featured: true,
  },
  {
    project: "Infrastructure Lab",
    category: "DevOps & Containers",
    description: "Terraform configurations and container recipes for self-hosted developer toolchains and observability stacks.",
    tag: "Infra / DevOps",
    url: "https://github.com/mukeshsingh10",
    featured: true,
  },
  {
    project: "Queue Dynamics Simulator",
    category: "Performance & Simulation",
    description: "Interactive simulation tool analyzing M/M/1 queuing behavior, backpressure, and p99 latency degradation under load.",
    tag: "Performance",
    url: "https://github.com/mukeshsingh10",
    featured: true,
  },
];
