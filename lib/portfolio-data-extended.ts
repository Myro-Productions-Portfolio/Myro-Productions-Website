export type ProjectCategory = 'entertainment' | 'automation' | 'software';

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
}

export const PORTFOLIO_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'entertainment', label: 'Entertainment' },
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
    metrics: ['50+ hours saved monthly', '11 integrated modules'],
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
      'Saves 50+ hours monthly through automated workflows',
      '11 integrated modules working seamlessly',
      'Real-time project progress tracking',
      'Local HTTP API for external tool integration',
      'Full-text search across all knowledge articles'
    ],
    projectType: 'personal',
    timeline: '6 months',
    role: 'Solo Developer & Designer'
  },
  {
    id: '4techs',
    title: '4Techs Scheduling App',
    category: 'software',
    description: 'AV technician scheduling and crew management application for coordinating field teams across multiple events.',
    tags: ['React Native', 'Expo', 'Mobile'],
    imageGradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
    metrics: ['200+ technicians managed', '80% faster scheduling'],
    challenge: 'AV production companies struggle with coordinating field technicians across multiple simultaneous events. Manual scheduling via phone calls and spreadsheets led to double-bookings, miscommunication, and inefficient crew utilization.',
    solution: 'Developed a mobile-first scheduling platform using React Native that allows managers to assign crews, technicians to accept/decline shifts, and real-time visibility into availability. Integrated push notifications for last-minute changes.',
    techStack: [
      'React Native',
      'Expo',
      'Firebase',
      'Push Notifications',
      'Real-time Database'
    ],
    results: [
      'Manages 200+ active technicians',
      '80% reduction in scheduling time',
      'Zero double-bookings since launch',
      'Real-time crew availability tracking',
      '95% technician adoption rate'
    ],
    projectType: 'work',
    timeline: '4 months',
    role: 'Lead Developer'
  },
  {
    id: 'bowlertrax',
    title: 'BowlerTrax',
    category: 'software',
    description: 'Bowling ball tracking app for enthusiasts to catalog their collection and track performance metrics.',
    tags: ['React Native', 'Expo', 'SQLite'],
    imageGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    metrics: ['500+ balls tracked', '1,000+ downloads'],
    challenge: 'Bowling enthusiasts often own multiple balls with different characteristics (weight, coverstock, layout). Remembering which ball to use for specific lane conditions and tracking performance over time was difficult.',
    solution: 'Created a mobile app using Expo and React Native that allows users to catalog their bowling ball collection, track drilling specs, lane conditions, and performance stats. Implemented local SQLite storage for offline access.',
    techStack: [
      'React Native',
      'Expo',
      'SQLite',
      'React Navigation',
      'AsyncStorage'
    ],
    results: [
      '1,000+ downloads on iOS and Android',
      '500+ bowling balls cataloged',
      'Average session time: 8 minutes',
      '4.7 star rating on app stores',
      'Active community feature requests'
    ],
    projectType: 'personal',
    timeline: '3 months',
    role: 'Solo Developer & Designer'
  },
  {
    id: 'event-tech-manager',
    title: 'Event Tech Manager',
    category: 'software',
    description: 'Equipment tracking and inventory management system for AV production companies managing rental gear.',
    tags: ['Next.js', 'PostgreSQL', 'Tailwind'],
    imageGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    metrics: ['10,000+ events handled', 'Zero double-bookings'],
    challenge: 'AV companies managing thousands of rental items (cameras, microphones, mixers, cables) across multiple simultaneous events face constant inventory conflicts and lost revenue from poor asset utilization.',
    solution: 'Built a web-based inventory and booking system using Next.js that tracks equipment availability, automates conflict detection, generates pull sheets for warehouse teams, and provides real-time inventory status across all events.',
    techStack: [
      'Next.js 14',
      'PostgreSQL',
      'Prisma ORM',
      'Tailwind CSS',
      'React Query',
      'PDF Generation'
    ],
    results: [
      'Manages 10,000+ events annually',
      'Zero double-bookings since implementation',
      '40% improvement in asset utilization',
      'Automated pull sheet generation',
      'Real-time inventory visibility'
    ],
    projectType: 'work',
    timeline: '5 months',
    role: 'Full-Stack Developer'
  },
  {
    id: 'quote-my-av',
    title: 'QuoteMyAV Platform',
    category: 'software',
    description: 'AI-powered AV equipment quoting platform with RAG-based knowledge retrieval for accurate proposal generation.',
    tags: ['Next.js', 'PostgreSQL', 'RAG AI'],
    imageGradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    metrics: ['90% quote accuracy', '5min average quote time'],
    challenge: 'Generating accurate AV equipment quotes requires deep knowledge of venue requirements, technical specifications, and pricing. Junior sales staff often underbid or overbid, losing deals or profitability.',
    solution: 'Developed an AI-powered quoting platform using Next.js and RAG (Retrieval-Augmented Generation) that analyzes event requirements, searches a knowledge base of past successful quotes, and generates itemized proposals with equipment recommendations.',
    techStack: [
      'Next.js 15',
      'PostgreSQL',
      'Vector Embeddings',
      'Anthropic Claude API',
      'Tailwind CSS',
      'Vercel AI SDK'
    ],
    results: [
      '90% quote accuracy rate',
      '5 minute average quote generation',
      '60% faster than manual quoting',
      'Consistent pricing across sales team',
      'Built-in upsell recommendations'
    ],
    projectType: 'work',
    timeline: '6 months',
    role: 'Lead AI Engineer'
  },
  {
    id: 'live-concert-av',
    title: 'Live Concert AV System',
    category: 'entertainment',
    description: 'Multi-camera live streaming setup with real-time switching and LED wall integration for stadium-scale events.',
    tags: ['Live Streaming', 'Video Production', 'LED Walls'],
    imageGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 'warehouse-inventory',
    title: 'Warehouse Inventory Automation',
    category: 'automation',
    description: 'RFID-based tracking system automating inventory management with real-time location monitoring and alerts.',
    tags: ['RFID', 'IoT', 'Data Analytics'],
    imageGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    id: 'festival-stage-management',
    title: 'Festival Stage Management',
    category: 'entertainment',
    description: 'Comprehensive LED wall control system managing multiple stages with synchronized lighting and video content.',
    tags: ['LED Control', 'DMX', 'Show Control'],
    imageGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
  {
    id: 'document-processing',
    title: 'Document Processing Pipeline',
    category: 'automation',
    description: 'Intelligent OCR and data extraction system processing thousands of documents with ML-powered classification.',
    tags: ['OCR', 'Machine Learning', 'Python'],
    imageGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  {
    id: 'corporate-event-production',
    title: 'Corporate Event Production',
    category: 'entertainment',
    description: 'Full AV production for multi-day conferences including keynote streaming, breakout rooms, and hybrid attendance.',
    tags: ['Conference AV', 'Hybrid Events', 'Webcast'],
    imageGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  },
  {
    id: 'smart-home-integration',
    title: 'Smart Home Integration',
    category: 'automation',
    description: 'Custom IoT device orchestration system unifying multiple smart home platforms with voice control.',
    tags: ['IoT', 'Home Automation', 'Voice Control'],
    imageGradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
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
