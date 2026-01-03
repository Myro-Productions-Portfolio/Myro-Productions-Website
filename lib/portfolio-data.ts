export type ProjectCategory = 'entertainment' | 'automation' | 'software';

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
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'automation', label: 'Automation' },
  { id: 'software', label: 'Software' },
] as const;

export const projects: Project[] = [
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
    metrics: ['200+ technicians managed', '80% faster scheduling'],
  },
  {
    id: 'ai-command-center',
    title: 'AI Command Center',
    category: 'software',
    description: 'Desktop productivity app integrating project management, knowledge base, and AI-powered task automation.',
    tags: ['Electron', 'React', 'AI Integration'],
    imageGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    metrics: ['50+ hours saved monthly', '11 integrated modules'],
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
    metrics: ['10,000+ events handled', 'Zero double-bookings'],
  },
  {
    id: 'quote-my-av',
    title: 'QuoteMyAV Platform',
    category: 'software',
    description: 'Web-based AV equipment quoting platform with inventory management and automated proposal generation.',
    tags: ['Next.js', 'PostgreSQL', 'RAG AI'],
    imageGradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    metrics: ['90% quote accuracy', '5min average quote time'],
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
    metrics: ['120fps tracking', 'Real-time detection'],
  },
];
