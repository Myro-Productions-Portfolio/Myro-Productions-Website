import { render, screen } from '@testing-library/react';
import SkillTag from '@/components/ui/SkillTag';

describe('SkillTag', () => {
  it('renders the skill name correctly', () => {
    render(<SkillTag skill="TypeScript" />);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('applies default variant styles when no variant is specified', () => {
    const { container } = render(<SkillTag skill="React" />);
    const tag = container.firstChild as HTMLElement;

    expect(tag).toHaveClass('bg-carbon-light');
    expect(tag).toHaveClass('text-text-secondary');
    expect(tag).toHaveClass('border-carbon-lighter');
  });

  it('applies accent variant styles correctly', () => {
    const { container } = render(<SkillTag skill="Next.js" variant="accent" />);
    const tag = container.firstChild as HTMLElement;

    expect(tag).toHaveClass('bg-accent/10');
    expect(tag).toHaveClass('text-accent');
    expect(tag).toHaveClass('border-accent/30');
  });

  it('applies moss variant styles correctly', () => {
    const { container } = render(<SkillTag skill="Python" variant="moss" />);
    const tag = container.firstChild as HTMLElement;

    expect(tag).toHaveClass('bg-moss-800/50');
    expect(tag).toHaveClass('text-moss-200');
    expect(tag).toHaveClass('border-moss-700');
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <SkillTag skill="Node.js" className="custom-class" />
    );
    const tag = container.firstChild as HTMLElement;

    expect(tag).toHaveClass('custom-class');
  });

  it('has proper accessibility role', () => {
    const { container } = render(<SkillTag skill="AI/ML" />);
    const tag = container.firstChild as HTMLElement;

    expect(tag).toHaveAttribute('role', 'listitem');
  });

  it('includes transition classes for hover effects', () => {
    const { container } = render(<SkillTag skill="Docker" />);
    const tag = container.firstChild as HTMLElement;

    expect(tag).toHaveClass('transition-colors');
    expect(tag).toHaveClass('duration-300');
  });

  it('renders with all standard tag classes', () => {
    const { container } = render(<SkillTag skill="GSAP" />);
    const tag = container.firstChild as HTMLElement;

    expect(tag).toHaveClass('inline-flex');
    expect(tag).toHaveClass('items-center');
    expect(tag).toHaveClass('px-3');
    expect(tag).toHaveClass('py-1.5');
    expect(tag).toHaveClass('rounded-full');
    expect(tag).toHaveClass('text-sm');
    expect(tag).toHaveClass('font-medium');
    expect(tag).toHaveClass('border');
  });

  it('handles special characters in skill names', () => {
    render(<SkillTag skill="C++" />);
    expect(screen.getByText('C++')).toBeInTheDocument();
  });

  it('handles long skill names without breaking layout', () => {
    const longSkillName = 'Very Long Technology Name That Spans Multiple Words';
    render(<SkillTag skill={longSkillName} />);
    expect(screen.getByText(longSkillName)).toBeInTheDocument();
  });
});
