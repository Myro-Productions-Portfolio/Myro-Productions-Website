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
    description: 'Desktop productivity app integrating project management, knowledge base, and AI-powered task automation.',
    tags: ['Electron', 'React', 'AI Integration'],
    imageGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    metrics: ['11 integrated modules', 'In Development'],
    challenge: 'Managing multiple personal projects, tasks, and knowledge across different tools was inefficient and time-consuming. Needed a unified system that could track projects, store knowledge, and integrate with AI for automation.',
    solution: 'Building a comprehensive desktop application using Electron and React that combines project management, task tracking, knowledge base, contacts, and calendar integration. Implementing an HTTP API server for programmatic access and integrating Claude AI for enhanced productivity.',
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
      'Full-text search across all knowledge articles'
    ],
    projectType: 'personal',
    timeline: 'Ongoing',
    role: 'Solo Developer & Designer',
    status: 'in-progress'
  },
  {
    id: '4techs',
    title: 'Team Scheduling App',
    category: 'software',
    description: 'Mobile-first crew scheduling and team management application for coordinating field teams across multiple projects.',
    tags: ['React Native', 'Expo', 'Mobile'],
    imageGradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
    metrics: ['Mobile-first design', 'In Development'],
    challenge: 'Companies with distributed field teams struggle with coordinating technicians across multiple simultaneous projects. Manual scheduling via phone calls and spreadsheets leads to double-bookings and inefficient utilization.',
    solution: 'Developing a mobile-first scheduling platform using React Native that allows managers to assign crews, technicians to accept/decline shifts, and provides real-time visibility into availability. Integrating push notifications for last-minute changes.',
    techStack: [
      'React Native',
      'Expo',
      'Firebase',
      'Push Notifications',
      'Real-time Database'
    ],
    results: [
      'Real-time crew availability tracking',
      'Push notification integration',
      'Shift accept/decline workflow'
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
    description: 'Bowling ball tracking app for enthusiasts to catalog their collection and track performance metrics.',
    tags: ['React Native', 'Expo', 'SQLite'],
    imageGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    metrics: ['Offline-first', 'In Development'],
    challenge: 'Bowling enthusiasts often own multiple balls with different characteristics (weight, coverstock, layout). Remembering which ball to use for specific lane conditions and tracking performance over time is difficult.',
    solution: 'Creating a mobile app using Expo and React Native that allows users to catalog their bowling ball collection, track drilling specs, lane conditions, and performance stats. Implementing local SQLite storage for offline access.',
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
    id: 'inventory-manager',
    title: 'Inventory Management System',
    category: 'software',
    description: 'Equipment tracking and inventory management system for companies managing assets across multiple locations.',
    tags: ['Next.js', 'PostgreSQL', 'Tailwind'],
    imageGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    metrics: ['Web-based', 'In Development'],
    challenge: 'Companies managing thousands of assets across multiple locations and projects face constant inventory conflicts and lost revenue from poor asset utilization.',
    solution: 'Building a web-based inventory and booking system using Next.js that tracks equipment availability, automates conflict detection, generates pull sheets for warehouse teams, and provides real-time inventory status.',
    techStack: [
      'Next.js 14',
      'PostgreSQL',
      'Prisma ORM',
      'Tailwind CSS',
      'React Query',
      'PDF Generation'
    ],
    results: [
      'Conflict detection system',
      'Automated pull sheet generation',
      'Real-time inventory visibility'
    ],
    projectType: 'personal',
    timeline: 'Ongoing',
    role: 'Solo Developer',
    status: 'in-progress'
  },
  {
    id: 'quote-my-av',
    title: 'QuoteMyAV Platform',
    category: 'software',
    description: 'AI-powered quoting platform with RAG-based knowledge retrieval for accurate, automated proposal generation.',
    tags: ['Next.js', 'PostgreSQL', 'RAG AI'],
    imageGradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    metrics: ['AI-powered', 'In Development'],
    challenge: 'Generating accurate equipment quotes requires deep knowledge of technical specifications and pricing. Manual quoting is slow and error-prone, leading to lost deals or reduced profitability.',
    solution: 'Developing an AI-powered quoting platform using Next.js and RAG (Retrieval-Augmented Generation) that analyzes requirements, searches a knowledge base of past quotes, and generates itemized proposals with recommendations.',
    techStack: [
      'Next.js 15',
      'PostgreSQL',
      'Vector Embeddings',
      'Anthropic Claude API',
      'Tailwind CSS',
      'Vercel AI SDK'
    ],
    results: [
      'RAG-based knowledge retrieval',
      'Automated proposal generation',
      'Equipment recommendation engine'
    ],
    projectType: 'personal',
    timeline: 'Ongoing',
    role: 'Solo Developer',
    status: 'in-progress'
  },
  {
    id: 'warehouse-inventory',
    title: 'Warehouse Inventory Automation',
    category: 'automation',
    description: 'RFID-based tracking system automating inventory management with real-time location monitoring and alerts.',
    tags: ['RFID', 'IoT', 'Data Analytics'],
    imageGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    metrics: ['In Planning'],
    status: 'planning'
  },
  {
    id: 'cloud-monitoring-stack',
    title: 'Cloud Monitoring Stack',
    category: 'infrastructure',
    description: 'Full observability platform with Grafana dashboards, Prometheus metrics, and custom exporters for multi-service monitoring.',
    tags: ['Grafana', 'Prometheus', 'Docker'],
    imageGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    metrics: ['In Development'],
    status: 'in-progress'
  },
  {
    id: 'document-processing',
    title: 'Document Processing Pipeline',
    category: 'automation',
    description: 'Intelligent OCR and data extraction system processing thousands of documents with ML-powered classification.',
    tags: ['OCR', 'Machine Learning', 'Python'],
    imageGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    metrics: ['In Development'],
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
