export type ProjectCategory = 'ai' | 'infrastructure' | 'automation' | 'software';

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  description: string;
  tags: string[];
  imageGradient: string;
  metrics?: string[];
  challenge?: string;
  solution?: string;
  techStack?: string[];
  results?: string[];
  projectType?: 'personal' | 'work';
  timeline?: string;
  role?: string;
  status?: 'in-progress' | 'planning' | 'completed';
  /** Marks an entry whose copy is intentionally unfinished, pending owner input. */
  placeholder?: boolean;
}

export const PORTFOLIO_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'ai', label: 'AI' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'automation', label: 'Automation' },
  { id: 'software', label: 'Software' },
] as const;

export const projects: Project[] = [
  {
    id: 'agorabench',
    title: 'AgoraBench',
    category: 'ai',
    description:
      'An autonomous AI government simulation. 30 LLM-driven agents run for office, propose and vote on legislation, form parties, debate on public forums, and govern through a full constitutional lifecycle — with no human in the loop.',
    tags: ['Multi-Agent AI', 'TypeScript', 'vLLM'],
    imageGradient: 'linear-gradient(135deg, #5b247a 0%, #1bcedf 100%)',
    metrics: ['42,000+ lines of TypeScript', '30 autonomous agents', 'Live at agorabench.com'],
    challenge:
      'Could a population of AI agents actually govern themselves? Not run a scripted demo — genuinely deliberate, build coalitions, pass laws, hold elections, and have their behavior emerge from memory and relationships rather than hardcoded rules. Doing that means coordinating 30 LLM agents in real time without a sequential inference bottleneck, and giving each agent enough persistent context to act consistently across hundreds of decisions.',
    solution:
      'Built a 17-phase simulation tick engine that fires every 90 minutes: bill proposals, committee and floor votes, veto overrides, elections, campaign speeches, forum discourse, and economic adjustments. Agent inference runs concurrently via a Redis-backed Bull queue and Promise.allSettled, so all 30 agents can vote on the same bill in parallel. Each agent carries a rolling 25-decision memory window compressed into LLM-generated summaries, dynamic vote-alignment tracking with allies and opponents, per-category policy positions, and election history — roughly 650 tokens of context injected per call. An external Claude orchestrator drives the simulation through an MCP server, applying personality nudges, injecting events, and triggering elections.',
    techStack: [
      'React 18',
      'TypeScript',
      'Node.js / Express',
      'PostgreSQL 16',
      'Drizzle ORM',
      'Redis / Bull',
      'vLLM (Gemma-4-31B)',
      'MCP',
      'Cloudflare Tunnel',
    ],
    results: [
      'Fully autonomous multi-agent legislative pipeline (committee → floor → presidential review → veto override)',
      'Parallel LLM execution across 30 agents per voting phase',
      'Persistent agent memory with summarization and coalition clustering',
      'External orchestration via MCP + REST endpoints',
      'Optional injection of real US Congress bill data into agent context',
    ],
    projectType: 'personal',
    timeline: '2026-Present',
    role: 'Solo Developer & Architect',
    status: 'in-progress',
  },
  {
    id: 'work-os',
    title: 'Work OS',
    category: 'ai',
    description:
      'Placeholder — a summary of professional work and systems built on the job. Copy pending: this entry will describe production systems, scope, and impact from day-to-day engineering work.',
    tags: ['Coming Soon'],
    imageGradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    metrics: ['Details coming soon'],
    challenge: 'TODO: owner to provide a summary of work-context engineering — what was built, the problem it solved, and the impact.',
    solution: 'TODO: owner input.',
    techStack: [],
    results: [],
    projectType: 'work',
    timeline: 'TODO',
    role: 'TODO',
    status: 'planning',
    placeholder: true,
  },
  {
    id: 'myro-productions-website',
    title: 'Myro Productions Website',
    category: 'infrastructure',
    description:
      'This site. A full-stack Next.js 15 portfolio and client-management platform with an admin dashboard, Stripe payments, and a Prisma/PostgreSQL backend — built to showcase cloud, AI, and web work and to be deployed on AWS behind Cloudflare.',
    tags: ['Next.js 15', 'TypeScript', 'AWS'],
    imageGradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
    metrics: ['Next.js 15 App Router', 'Stripe + Prisma backend', 'Containerized for AWS'],
    challenge:
      'Build a professional portfolio that is also a real platform — not a static page, but a type-safe full-stack app with authentication, payments, and a CRM-style admin area — and host it cost-effectively while doubling as a hands-on AWS learning project.',
    solution:
      'Built with Next.js 15 (App Router) and React 19, TypeScript end to end, Tailwind CSS 4, and GSAP scroll animations. A Prisma/PostgreSQL backend powers a JWT-authenticated admin dashboard for clients, projects, payments, and subscriptions, with Stripe handling billing and webhooks. Packaged as a multi-stage Docker image (standalone output) targeting AWS ECS Fargate with RDS, fronted by Cloudflare for DNS, CDN, and DDoS protection.',
    techStack: [
      'Next.js 15',
      'React 19',
      'TypeScript',
      'Tailwind CSS 4',
      'GSAP',
      'Prisma',
      'PostgreSQL',
      'Stripe',
      'Docker',
      'AWS ECS Fargate',
      'Cloudflare',
    ],
    results: [
      'Type-safe full-stack architecture with JWT auth and Stripe payments',
      'Dockerized standalone build deployable to AWS',
      'Cloudflare edge for DNS, caching, and security',
    ],
    projectType: 'personal',
    timeline: 'Ongoing',
    role: 'Solo Developer & Designer',
    status: 'in-progress',
  },
];

// Helper function to get project by slug
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.id === slug);
}

// Helper function to get all project slugs for static generation
export function getAllProjectSlugs(): string[] {
  return projects.map((project) => project.id);
}
