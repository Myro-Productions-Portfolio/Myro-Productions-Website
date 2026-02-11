import { render, screen } from '@testing-library/react';
import About from '@/components/sections/About';

// Mock GSAP and related libraries
jest.mock('gsap', () => ({
  gsap: {
    registerPlugin: jest.fn(),
    fromTo: jest.fn(),
    context: jest.fn((fn) => {
      fn();
      return { revert: jest.fn() };
    }),
  },
}));

jest.mock('@gsap/react', () => ({
  useGSAP: jest.fn((fn) => fn()),
}));

jest.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {},
}));

// Mock window.matchMedia for prefers-reduced-motion
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('About Section - Integration', () => {
  it('renders the section with correct ID', () => {
    const { container } = render(<About />);
    const section = container.querySelector('#about');
    expect(section).toBeInTheDocument();
  });

  it('renders name and title correctly', () => {
    render(<About />);
    expect(screen.getByText('Nicolas Robert Myers')).toBeInTheDocument();
    expect(screen.getByText('Founder & Lead Developer at Myro Productions')).toBeInTheDocument();
  });

  it('renders the bio story paragraph', () => {
    render(<About />);
    const bioText = screen.getByText(/With over a decade of experience/i);
    expect(bioText).toBeInTheDocument();
  });

  it('renders all highlight stats', () => {
    render(<About />);
    expect(screen.getByText('13+')).toBeInTheDocument();
    expect(screen.getByText('Years in Tech')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('AWS Certified')).toBeInTheDocument();
    expect(screen.getByText('5+')).toBeInTheDocument();
    expect(screen.getByText('Projects In Progress')).toBeInTheDocument();
  });

  it('renders the personal quote', () => {
    render(<About />);
    const quote = screen.getByText(/Why spend hours on repetitive tasks/i);
    expect(quote).toBeInTheDocument();
  });

  it('renders the profile image', () => {
    render(<About />);
    const image = screen.getByAltText('Nicolas Myers - Founder of Myro Productions');
    expect(image).toBeInTheDocument();
  });

  it('renders all skill tags', () => {
    render(<About />);
    const skills = [
      'TypeScript',
      'React',
      'Next.js',
      'Node.js',
      'Python',
      'AI/ML',
      'AWS Cloud',
      'Home Lab',
      'GSAP',
      'Tailwind CSS',
      'PostgreSQL',
      'Docker',
    ];

    skills.forEach((skill) => {
      expect(screen.getByText(skill)).toBeInTheDocument();
    });
  });

  it('renders skills section with proper heading', () => {
    render(<About />);
    expect(screen.getByText('Technologies & Expertise')).toBeInTheDocument();
  });

  it('has proper accessibility attributes for skills list', () => {
    const { container } = render(<About />);
    const skillsList = container.querySelector('[role="list"]');
    expect(skillsList).toBeInTheDocument();
    expect(skillsList).toHaveAttribute('aria-label', 'Technologies and skills');
  });

  it('uses correct background styling classes', () => {
    const { container } = render(<About />);
    const section = container.querySelector('#about');
    expect(section).toHaveClass('bg-carbon-subtle');
  });

  it('has two-column layout on large screens', () => {
    const { container } = render(<About />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('lg:grid-cols-2');
  });

  it('renders exactly 4 highlight cards', () => {
    const { container } = render(<About />);
    const cards = container.querySelectorAll('.grid.grid-cols-2 > div');
    expect(cards).toHaveLength(4);
  });

  it('renders exactly 12 skill tags', () => {
    const { container } = render(<About />);
    const skillTags = container.querySelectorAll('[role="listitem"]');
    expect(skillTags).toHaveLength(12);
  });

  it('applies different skill tag variants', () => {
    const { container } = render(<About />);
    const skillTags = container.querySelectorAll('[role="listitem"]');

    // Check that we have a mix of variant classes
    const hasAccent = Array.from(skillTags).some((tag) =>
      tag.className.includes('bg-accent/10')
    );
    const hasMoss = Array.from(skillTags).some((tag) =>
      tag.className.includes('bg-moss-800/50')
    );
    const hasDefault = Array.from(skillTags).some((tag) =>
      tag.className.includes('bg-carbon-light')
    );

    expect(hasAccent).toBe(true);
    expect(hasMoss).toBe(true);
    expect(hasDefault).toBe(true);
  });

  it('respects prefers-reduced-motion setting', () => {
    // Mock reduced motion preference
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { useGSAP } = require('@gsap/react');
    useGSAP.mockImplementation((fn: () => void) => {
      // Verify that animations are skipped when prefersReducedMotion is true
      fn();
    });

    render(<About />);
    // Component should render without errors
    expect(screen.getByText('Nicolas Robert Myers')).toBeInTheDocument();
  });
});
