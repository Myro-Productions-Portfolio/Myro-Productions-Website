import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Footer from '@/components/sections/Footer';

// Mock window.scrollTo
const mockScrollTo = jest.fn();
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: mockScrollTo,
});

describe('Footer Component', () => {
  beforeEach(() => {
    mockScrollTo.mockClear();
  });

  it('renders the brand name and tagline', () => {
    render(<Footer />);

    expect(screen.getByText('MYRO')).toBeInTheDocument();
    expect(
      screen.getByText(/Rapid prototyping, automation solutions/i)
    ).toBeInTheDocument();
  });

  it('renders all quick links', () => {
    render(<Footer />);

    const quickLinks = ['Home', 'Services', 'Portfolio', 'About', 'Contact'];
    quickLinks.forEach((link) => {
      expect(screen.getByRole('link', { name: link })).toBeInTheDocument();
    });
  });

  it('renders contact information', () => {
    render(<Footer />);

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /nmyers@myroproductions.com/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Remote & On-site Available/i)).toBeInTheDocument();
    expect(screen.getByText(/Mon - Fri: 9AM - 6PM EST/i)).toBeInTheDocument();
  });

  it('renders social media links with proper accessibility', () => {
    render(<Footer />);

    expect(
      screen.getByLabelText('Visit Myro Productions on LinkedIn')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Visit Myro Productions on GitHub')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Visit Myro Productions on Twitter')
    ).toBeInTheDocument();
  });

  it('social links have correct target and rel attributes', () => {
    render(<Footer />);

    const linkedInLink = screen.getByLabelText(
      'Visit Myro Productions on LinkedIn'
    );
    expect(linkedInLink).toHaveAttribute('target', '_blank');
    expect(linkedInLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders copyright with current year', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`${currentYear} Myro Productions`))
    ).toBeInTheDocument();
  });

  it('renders "Built with Next.js" credit', () => {
    render(<Footer />);

    expect(screen.getByText(/Built with/i)).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();
  });

  it('has a back to top button', () => {
    render(<Footer />);

    expect(
      screen.getByRole('button', { name: /scroll back to top/i })
    ).toBeInTheDocument();
  });

  it('scrolls to top when back to top button is clicked', async () => {
    const user = userEvent.setup();
    render(<Footer />);

    const backToTopButton = screen.getByRole('button', {
      name: /scroll back to top/i,
    });

    await user.click(backToTopButton);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('email link has correct href', () => {
    render(<Footer />);

    const emailLink = screen.getByRole('link', {
      name: /nmyers@myroproductions.com/i,
    });
    expect(emailLink).toHaveAttribute('href', 'mailto:nmyers@myroproductions.com');
  });

  it('quick links have correct href attributes', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/'
    );
    expect(screen.getByRole('link', { name: 'Services' })).toHaveAttribute(
      'href',
      '#services'
    );
    expect(screen.getByRole('link', { name: 'Portfolio' })).toHaveAttribute(
      'href',
      '#portfolio'
    );
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute(
      'href',
      '#about'
    );
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute(
      'href',
      '#contact'
    );
  });

  it('renders with proper semantic HTML structure', () => {
    const { container } = render(<Footer />);

    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });
});
