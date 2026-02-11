export type ProjectCategory = 'infrastructure' | 'automation' | 'software';

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
}

export const PORTFOLIO_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'automation', label: 'Automation' },
  { id: 'software', label: 'Software' },
] as const;

export const projects: Project[] = [
  {
    id: 'ai-command-center',
    title: 'AI Command Center',
    category: 'software',
    description: 'Electron-based desktop app for project management, knowledge base, task tracking, and AI-powered workflow automation with a local HTTP API.',
    tags: ['Electron', 'React', 'AI Integration'],
    imageGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    metrics: ['11 integrated modules', '50+ hours saved monthly'],
    challenge: 'Managing multiple personal projects, tasks, and knowledge across different tools was inefficient and time-consuming. Needed a unified system that could track projects, store knowledge, and integrate with AI for automation.',
    solution: 'Built a comprehensive desktop application using Electron and React that combines project management, task tracking, knowledge base, contacts, and calendar integration. Implemented an HTTP API server for programmatic access and integrated Claude AI for enhanced productivity.',
    techStack: [
      'Electron',
      'React 18',
      'Vite',
      'SQLite',
      'Node.js',
      'Express',
      'Winston Logging',
      'GSAP Animations'
    ],
    results: [
      'Real-time project progress tracking',
      'Local HTTP API for external tool integration',
      'Full-text search across all knowledge articles',
      'DGX Spark GPU training management module'
    ],
    projectType: 'personal',
    timeline: 'Ongoing',
    role: 'Solo Developer & Designer',
    status: 'in-progress'
  },
  {
    id: 'showcore',
    title: 'ShowCore',
    category: 'software',
    description: 'Technician discovery marketplace connecting AV professionals with live event companies. Full-stack web platform with search, profiles, and booking.',
    tags: ['Next.js', 'TypeScript', 'PostgreSQL'],
    imageGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    metrics: ['Full marketplace platform', 'Production deployed'],
    challenge: 'AV production companies struggle to find qualified freelance technicians for events, relying on word-of-mouth and outdated contact lists. Technicians have no central platform to showcase skills and availability.',
    solution: 'Built a full-stack marketplace platform using Next.js where technicians create profiles with skills, certifications, and availability, and companies can search, filter, and book talent for their events.',
    techStack: [
      'Next.js',
      'TypeScript',
      'PostgreSQL',
      'Prisma ORM',
      'Tailwind CSS',
      'Vercel'
    ],
    results: [
      'Searchable technician profiles',
      'Skills and certification verification',
      'Booking and availability management'
    ],
    projectType: 'personal',
    timeline: 'Ongoing',
    role: 'Solo Developer',
    status: 'in-progress'
  },
  {
    id: 'aws-training-dashboard',
    title: 'AWS Training Dashboard',
    category: 'infrastructure',
    description: 'React dashboard deployed to Amazon Fire TV for tracking AWS certification progress, study materials, and training metrics.',
    tags: ['React', 'AWS', 'Fire TV'],
    imageGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    metrics: ['AWS CCP Certified', 'SA Associate in progress'],
    challenge: 'Studying for AWS certifications while working full-time required a way to keep training materials visible and accessible. Standard study apps disappear behind other windows.',
    solution: 'Created a React dashboard app that runs on Amazon Fire TV, displaying AWS certification progress, upcoming study topics, and key concepts on a dedicated screen that is always visible in the workspace.',
    techStack: [
      'React',
      'TypeScript',
      'Fire TV Web App',
      'Tailwind CSS',
      'AWS SDK'
    ],
    results: [
      'AWS Cloud Practitioner certification passed (Jan 2026)',
      'Solutions Architect Associate study tracking',
      'Always-visible training dashboard on Fire TV'
    ],
    projectType: 'personal',
    timeline: 'Ongoing',
    role: 'Solo Developer',
    status: 'in-progress'
  },
  {
    id: 'claudarity',
    title: 'Claudarity',
    category: 'automation',
    description: 'Cross-platform TypeScript context engineering framework for AI coding assistants. Structures project context for optimal AI collaboration.',
    tags: ['TypeScript', 'AI', 'Context Engineering'],
    imageGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    challenge: 'AI coding assistants lose effectiveness without proper project context. Developers waste time re-explaining architecture, conventions, and constraints every session.',
    solution: 'Developed a framework that structures and manages project context files (CLAUDE.md, CLAUDELONGTERM.md) using a standardized format. Provides templates and tooling to maintain high-quality context across projects.',
    techStack: [
      'TypeScript',
      'Node.js',
      'Markdown',
      'Context Engineering Patterns'
    ],
    results: [
      'Standardized context format across 50+ projects',
      'Reduced AI ramp-up time per session',
      'Open source on GitHub'
    ],
    projectType: 'personal',
    timeline: '2024-Present',
    role: 'Solo Developer',
    status: 'completed'
  },
  {
    id: 'dgx-spark-app',
    title: 'DGX Spark Management',
    category: 'infrastructure',
    description: 'Standalone application for managing NVIDIA DGX Spark GPUs -- monitoring metrics, tracking training jobs, and remote execution via SSH.',
    tags: ['Node.js', 'SSH', 'GPU Computing'],
    imageGradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    challenge: 'Managing GPU training jobs on remote DGX Spark systems requires constant SSH sessions, manual metric checks, and no centralized view of job history or GPU utilization over time.',
    solution: 'Built a dedicated management application with SSH connectivity, real-time GPU metric monitoring (utilization, memory, temperature), training job tracking, and historical metrics with charting.',
    techStack: [
      'Node.js',
      'SSH2',
      'SQLite',
      'React',
      'Chart.js'
    ],
    results: [
      'Real-time GPU metric monitoring',
      'Training job lifecycle management',
      'Historical metrics and charting'
    ],
    projectType: 'personal',
    timeline: 'Ongoing',
    role: 'Solo Developer',
    status: 'in-progress'
  },
  {
    id: 'bowlertrax',
    title: 'BowlerTrax',
    category: 'software',
    description: 'Mobile bowling analytics app with ball collection cataloging, performance tracking per ball, and offline-first local storage.',
    tags: ['React Native', 'Expo', 'SQLite'],
    imageGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    metrics: ['Offline-first', 'Computer vision tracking'],
    challenge: 'Bowling enthusiasts own multiple balls with different characteristics. Remembering which ball to use for specific lane conditions and tracking performance over time is difficult without a dedicated tool.',
    solution: 'Creating a mobile app using Expo and React Native that catalogs bowling ball collections, tracks drilling specs, lane conditions, and performance stats with offline-first local SQLite storage.',
    techStack: [
      'React Native',
      'Expo',
      'SQLite',
      'React Navigation',
      'AsyncStorage'
    ],
    results: [
      'Ball collection cataloging',
      'Performance tracking per ball',
      'Offline data persistence'
    ],
    projectType: 'personal',
    timeline: 'Ongoing',
    role: 'Solo Developer & Designer',
    status: 'in-progress'
  },
  {
    id: 'auto-claude',
    title: 'Auto-Claude',
    category: 'automation',
    description: 'Automated Claude Code workflows and desktop automation system. Orchestrates multi-step AI coding tasks with spec-driven execution.',
    tags: ['Claude API', 'Automation', 'Desktop'],
    imageGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    challenge: 'Running repetitive multi-step coding tasks with Claude Code requires manual intervention at each step. Complex workflows involving file creation, testing, and deployment need orchestration.',
    solution: 'Built an automation layer that reads spec files defining multi-step workflows and executes them through Claude Code automatically, handling branching logic, error recovery, and progress tracking.',
    techStack: [
      'Node.js',
      'Claude API',
      'Shell Scripting',
      'JSON Spec Format'
    ],
    results: [
      'Spec-driven automated workflows',
      'Multi-step task orchestration',
      'Error recovery and retry logic'
    ],
    projectType: 'personal',
    timeline: 'Ongoing',
    role: 'Solo Developer',
    status: 'in-progress'
  },
  {
    id: 'chrome-devtools-mcp',
    title: 'Chrome DevTools MCP',
    category: 'automation',
    description: 'Model Context Protocol server enabling AI assistants to control Chrome DevTools -- inspect elements, run JS, capture network traffic.',
    tags: ['MCP', 'Chrome', 'DevTools'],
    imageGradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    challenge: 'AI coding assistants cannot directly interact with running web applications in the browser, making debugging and testing require constant manual back-and-forth.',
    solution: 'Implemented an MCP server that connects to Chrome DevTools Protocol, exposing browser inspection, JavaScript execution, network monitoring, and DOM manipulation as tools that AI assistants can call directly.',
    techStack: [
      'TypeScript',
      'Chrome DevTools Protocol',
      'MCP SDK',
      'WebSocket'
    ],
    results: [
      'AI-driven browser inspection',
      'Remote JavaScript execution',
      'Network traffic capture and analysis'
    ],
    projectType: 'personal',
    timeline: 'Completed',
    role: 'Solo Developer',
    status: 'completed'
  },
  {
    id: 'myro-productions-website',
    title: 'Myro Productions Website',
    category: 'infrastructure',
    description: 'This very website -- Next.js 15 with GSAP animations, self-hosted via Docker on a Mac Mini home lab with Caddy reverse proxy and Cloudflare tunnels.',
    tags: ['Next.js', 'Docker', 'Caddy'],
    imageGradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
    challenge: 'Needed a professional portfolio website that showcases cloud/AI/web development skills while also demonstrating self-hosting capabilities on personal infrastructure.',
    solution: 'Built with Next.js 15, TypeScript, and GSAP animations. Dockerized and self-hosted on a Mac Mini home lab behind Caddy reverse proxy with Cloudflare tunnels for public access and automated SSL.',
    techStack: [
      'Next.js 15',
      'TypeScript',
      'Tailwind CSS',
      'GSAP',
      'Docker',
      'Caddy',
      'Cloudflare Tunnels'
    ],
    results: [
      'Self-hosted on home lab infrastructure',
      'Automated Docker deployments from Gitea',
      'GSAP-powered animations and interactions'
    ],
    projectType: 'personal',
    timeline: 'Ongoing',
    role: 'Solo Developer & Designer',
    status: 'in-progress'
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
