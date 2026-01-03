import { render, screen } from '@testing-library/react';
import PortfolioCard from '@/components/ui/PortfolioCard';
import type { Project } from '@/lib/portfolio-data';

const mockProject: Project = {
  id: 'test-project',
  title: 'Test Project',
  category: 'software',
  description: 'This is a test project description for unit testing purposes.',
  tags: ['React', 'TypeScript', 'Testing'],
  imageGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
};

describe('PortfolioCard', () => {
  it('renders project title', () => {
    render(<PortfolioCard project={mockProject} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('renders project description', () => {
    render(<PortfolioCard project={mockProject} />);
    expect(
      screen.getByText('This is a test project description for unit testing purposes.')
    ).toBeInTheDocument();
  });

  it('renders category tag with correct text', () => {
    render(<PortfolioCard project={mockProject} />);
    expect(screen.getByText('software')).toBeInTheDocument();
  });

  it('renders all project tags', () => {
    render(<PortfolioCard project={mockProject} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Testing')).toBeInTheDocument();
  });

  it('applies gradient background to image area', () => {
    const { container } = render(<PortfolioCard project={mockProject} />);
    const imageDiv = container.querySelector('div[style*="linear-gradient"]');
    expect(imageDiv).toBeInTheDocument();
    expect(imageDiv).toHaveStyle({
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    });
  });

  it('renders "View Details" overlay text', () => {
    render(<PortfolioCard project={mockProject} />);
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  it('uses article semantic HTML element', () => {
    const { container } = render(<PortfolioCard project={mockProject} />);
    expect(container.querySelector('article')).toBeInTheDocument();
  });
});
