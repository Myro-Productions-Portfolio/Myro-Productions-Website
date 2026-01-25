import { render, screen, fireEvent } from '@testing-library/react';
import FilterButtons from '@/components/ui/FilterButtons';

describe('FilterButtons', () => {
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it('renders all category buttons', () => {
    render(<FilterButtons activeFilter="all" onFilterChange={mockOnFilterChange} />);

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
    expect(screen.getByText('Automation')).toBeInTheDocument();
    expect(screen.getByText('Software')).toBeInTheDocument();
  });

  it('highlights active filter button', () => {
    render(<FilterButtons activeFilter="software" onFilterChange={mockOnFilterChange} />);

    const softwareButton = screen.getByText('Software');
    expect(softwareButton).toHaveClass('bg-accent');
  });

  it('calls onFilterChange when button is clicked', () => {
    render(<FilterButtons activeFilter="all" onFilterChange={mockOnFilterChange} />);

    const entertainmentButton = screen.getByText('Entertainment');
    fireEvent.click(entertainmentButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith('entertainment');
  });

  it('calls onFilterChange with correct category id', () => {
    render(<FilterButtons activeFilter="all" onFilterChange={mockOnFilterChange} />);

    const automationButton = screen.getByText('Automation');
    fireEvent.click(automationButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith('automation');
    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
  });

  it('sets aria-pressed attribute correctly', () => {
    render(<FilterButtons activeFilter="entertainment" onFilterChange={mockOnFilterChange} />);

    const allButton = screen.getByText('All');
    const entertainmentButton = screen.getByText('Entertainment');

    expect(allButton).toHaveAttribute('aria-pressed', 'false');
    expect(entertainmentButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('has proper ARIA role for button group', () => {
    const { container } = render(
      <FilterButtons activeFilter="all" onFilterChange={mockOnFilterChange} />
    );

    const group = container.querySelector('[role="group"]');
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('aria-label', 'Project category filters');
  });

  it('applies hover styles to inactive buttons', () => {
    render(<FilterButtons activeFilter="all" onFilterChange={mockOnFilterChange} />);

    const softwareButton = screen.getByText('Software');
    expect(softwareButton).toHaveClass('bg-carbon-light');
    expect(softwareButton).toHaveClass('hover:bg-moss-700');
  });
});
