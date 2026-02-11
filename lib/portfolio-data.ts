export type ProjectCategory = 'infrastructure' | 'automation' | 'software';

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  description: string;
  tags: string[];
  imageGradient: string; // Temporary gradient for placeholder
  metrics?: string[]; // Measurable outcome metrics
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
  },
  {
    id: 'showcore',
    title: 'ShowCore',
    category: 'software',
    description: 'Technician discovery marketplace connecting AV professionals with live event companies. Full-stack web platform with search, profiles, and booking.',
    tags: ['Next.js', 'TypeScript', 'PostgreSQL'],
    imageGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    metrics: ['Full marketplace platform', 'Production deployed'],
  },
  {
    id: 'aws-training-dashboard',
    title: 'AWS Training Dashboard',
    category: 'infrastructure',
    description: 'React dashboard deployed to Amazon Fire TV for tracking AWS certification progress, study materials, and training metrics.',
    tags: ['React', 'AWS', 'Fire TV'],
    imageGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    metrics: ['AWS CCP Certified', 'SA Associate in progress'],
  },
  {
    id: 'claudarity',
    title: 'Claudarity',
    category: 'automation',
    description: 'Cross-platform TypeScript context engineering framework for AI coding assistants. Structures project context for optimal AI collaboration.',
    tags: ['TypeScript', 'AI', 'Context Engineering'],
    imageGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
  {
    id: 'dgx-spark-app',
    title: 'DGX Spark Management',
    category: 'infrastructure',
    description: 'Standalone application for managing NVIDIA DGX Spark GPUs -- monitoring metrics, tracking training jobs, and remote execution via SSH.',
    tags: ['Node.js', 'SSH', 'GPU Computing'],
    imageGradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  },
  {
    id: 'bowlertrax',
    title: 'BowlerTrax',
    category: 'software',
    description: 'Mobile bowling analytics app with ball collection cataloging, performance tracking per ball, and offline-first local storage.',
    tags: ['React Native', 'Expo', 'SQLite'],
    imageGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    metrics: ['Offline-first', 'Computer vision tracking'],
  },
  {
    id: 'auto-claude',
    title: 'Auto-Claude',
    category: 'automation',
    description: 'Automated Claude Code workflows and desktop automation system. Orchestrates multi-step AI coding tasks with spec-driven execution.',
    tags: ['Claude API', 'Automation', 'Desktop'],
    imageGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  },
  {
    id: 'chrome-devtools-mcp',
    title: 'Chrome DevTools MCP',
    category: 'automation',
    description: 'Model Context Protocol server enabling AI assistants to control Chrome DevTools -- inspect elements, run JS, capture network traffic.',
    tags: ['MCP', 'Chrome', 'DevTools'],
    imageGradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  },
  {
    id: 'myro-productions-website',
    title: 'Myro Productions Website',
    category: 'infrastructure',
    description: 'This very website -- Next.js 15 with GSAP animations, self-hosted via Docker on a Mac Mini home lab with Caddy reverse proxy and Cloudflare tunnels.',
    tags: ['Next.js', 'Docker', 'Caddy'],
    imageGradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
  },
];
