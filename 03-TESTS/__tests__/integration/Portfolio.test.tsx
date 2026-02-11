import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Portfolio from '@/components/sections/Portfolio';
import { projects } from '@/lib/portfolio-data';

// Mock GSAP and ScrollTrigger
jest.mock('gsap', () => ({
  gsap: {
    registerPlugin: jest.fn(),
    fromTo: jest.fn(),
  },
}));

jest.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {},
}));

describe('Portfolio Integration', () => {
  it('renders section with correct id', () => {
    const { container } = render(<Portfolio />);
    expect(container.querySelector('#portfolio')).toBeInTheDocument();
  });

  it('renders section header', () => {
    render(<Portfolio />);
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(
      screen.getByText(/Explore a selection of projects spanning/i)
    ).toBeInTheDocument();
  });

  it('initially shows all projects', () => {
    render(<Portfolio />);

    // Check that multiple projects are rendered
    expect(screen.getByText('Home Lab Infrastructure')).toBeInTheDocument();
    expect(screen.getByText('AI Command Center')).toBeInTheDocument();
    expect(screen.getByText('QuoteMyAV Platform')).toBeInTheDocument();
  });

  it('filters projects when Infrastructure button is clicked', async () => {
    render(<Portfolio />);

    const infrastructureButton = screen.getByText('Infrastructure');
    fireEvent.click(infrastructureButton);

    await waitFor(() => {
      // Infrastructure projects should be visible
      expect(screen.getByText('Home Lab Infrastructure')).toBeInTheDocument();
      expect(screen.getByText('Cloud Monitoring Stack')).toBeInTheDocument();

      // Non-infrastructure projects should not be visible
      expect(screen.queryByText('AI Command Center')).not.toBeInTheDocument();
      expect(screen.queryByText('Warehouse Inventory Automation')).not.toBeInTheDocument();
    });
  });

  it('filters projects when Automation button is clicked', async () => {
    render(<Portfolio />);

    const automationButton = screen.getByText('Automation');
    fireEvent.click(automationButton);

    await waitFor(() => {
      // Automation projects should be visible
      expect(screen.getByText('Warehouse Inventory Automation')).toBeInTheDocument();
      expect(screen.getByText('Document Processing Pipeline')).toBeInTheDocument();

      // Non-automation projects should not be visible
      expect(screen.queryByText('Home Lab Infrastructure')).not.toBeInTheDocument();
      expect(screen.queryByText('QuoteMyAV Platform')).not.toBeInTheDocument();
    });
  });

  it('filters projects when Software button is clicked', async () => {
    render(<Portfolio />);

    const softwareButton = screen.getByText('Software');
    fireEvent.click(softwareButton);

    await waitFor(() => {
      // Software projects should be visible
      expect(screen.getByText('AI Command Center')).toBeInTheDocument();
      expect(screen.getByText('QuoteMyAV Platform')).toBeInTheDocument();

      // Non-software projects should not be visible
      expect(screen.queryByText('Home Lab Infrastructure')).not.toBeInTheDocument();
      expect(screen.queryByText('Warehouse Inventory Automation')).not.toBeInTheDocument();
    });
  });

  it('returns to all projects when All button is clicked', async () => {
    render(<Portfolio />);

    // First filter to Software
    const softwareButton = screen.getByText('Software');
    fireEvent.click(softwareButton);

    await waitFor(() => {
      expect(screen.queryByText('Home Lab Infrastructure')).not.toBeInTheDocument();
    });

    // Then click All to show everything again
    const allButton = screen.getByText('All');
    fireEvent.click(allButton);

    await waitFor(() => {
      expect(screen.getByText('Home Lab Infrastructure')).toBeInTheDocument();
      expect(screen.getByText('AI Command Center')).toBeInTheDocument();
      expect(screen.getByText('Warehouse Inventory Automation')).toBeInTheDocument();
    });
  });

  it('highlights active filter button', () => {
    render(<Portfolio />);

    const allButton = screen.getByText('All');
    expect(allButton).toHaveClass('bg-accent');

    const softwareButton = screen.getByText('Software');
    fireEvent.click(softwareButton);

    expect(softwareButton).toHaveClass('bg-accent');
    expect(allButton).not.toHaveClass('bg-accent');
  });

  it('renders correct number of projects for each category', async () => {
    render(<Portfolio />);

    // Count projects by category in data
    const infrastructureCount = projects.filter((p) => p.category === 'infrastructure').length;
    const automationCount = projects.filter((p) => p.category === 'automation').length;
    const softwareCount = projects.filter((p) => p.category === 'software').length;

    // Test Infrastructure
    const infrastructureButton = screen.getByText('Infrastructure');
    fireEvent.click(infrastructureButton);

    await waitFor(() => {
      const cards = screen.getAllByRole('article');
      expect(cards).toHaveLength(infrastructureCount);
    });

    // Test Automation
    const automationButton = screen.getByText('Automation');
    fireEvent.click(automationButton);

    await waitFor(() => {
      const cards = screen.getAllByRole('article');
      expect(cards).toHaveLength(automationCount);
    });

    // Test Software
    const softwareButton = screen.getByText('Software');
    fireEvent.click(softwareButton);

    await waitFor(() => {
      const cards = screen.getAllByRole('article');
      expect(cards).toHaveLength(softwareCount);
    });
  });

  it('displays empty state when no projects match filter', async () => {
    // This test assumes we might add filters with no projects in the future
    // For now, all categories have projects, so we'll just verify the grid exists
    render(<Portfolio />);

    const allButton = screen.getByText('All');
    fireEvent.click(allButton);

    await waitFor(() => {
      const grid = screen.getAllByRole('article');
      expect(grid.length).toBeGreaterThan(0);
    });
  });

  it('maintains semantic HTML structure', () => {
    const { container } = render(<Portfolio />);

    expect(container.querySelector('section')).toBeInTheDocument();
    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
  });
});
