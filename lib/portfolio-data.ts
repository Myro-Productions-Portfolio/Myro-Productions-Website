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
    id: 'home-lab-infrastructure',
    title: 'Home Lab Infrastructure',
    category: 'infrastructure',
    description: 'Enterprise-grade home lab with Mac Mini servers, DGX Spark GPUs, Docker orchestration, and Grafana/Prometheus monitoring.',
    tags: ['Docker', 'Grafana', 'Prometheus'],
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
    id: 'cloud-monitoring-stack',
    title: 'Cloud Monitoring Stack',
    category: 'infrastructure',
    description: 'Full observability platform with Grafana dashboards, Prometheus metrics, and custom exporters for multi-service monitoring.',
    tags: ['Grafana', 'Prometheus', 'Docker'],
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
    description: 'AI-powered quoting platform using RAG (Retrieval-Augmented Generation) for intelligent proposal generation and inventory management.',
    tags: ['Next.js', 'PostgreSQL', 'RAG AI'],
    imageGradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    metrics: ['90% quote accuracy', '5min average quote time'],
  },
  {
    id: 'web-hosting-platform',
    title: 'Self-Hosted Web Platform',
    category: 'infrastructure',
    description: 'Caddy-based reverse proxy with Docker containers hosting multiple client websites, Cloudflare tunnels, and automated SSL.',
    tags: ['Caddy', 'Docker', 'Cloudflare'],
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
