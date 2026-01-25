import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Select from '@/components/ui/Select';

const mockOptions = [
  { value: '', label: 'Select an option' },
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

describe('Select Component', () => {
  describe('Rendering', () => {
    it('renders select field without label', () => {
      render(<Select options={mockOptions} />);
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('renders select field with label', () => {
      render(<Select label="Choose Option" options={mockOptions} />);
      const label = screen.getByText('Choose Option');
      const select = screen.getByLabelText('Choose Option');
      expect(label).toBeInTheDocument();
      expect(select).toBeInTheDocument();
    });

    it('displays required indicator when required prop is true', () => {
      render(<Select label="Choose Option" options={mockOptions} required />);
      const requiredIndicator = screen.getByText('*');
      expect(requiredIndicator).toBeInTheDocument();
      expect(requiredIndicator).toHaveClass('text-accent');
    });

    it('displays helper text when provided', () => {
      render(
        <Select
          label="Choose Option"
          options={mockOptions}
          helperText="Select one option from the list"
        />
      );
      const helperText = screen.getByText('Select one option from the list');
      expect(helperText).toBeInTheDocument();
    });

    it('displays error message when error prop is provided', () => {
      render(
        <Select
          label="Choose Option"
          options={mockOptions}
          error="Selection is required"
        />
      );
      const errorMessage = screen.getByText('Selection is required');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('text-red-500');
    });

    it('renders all provided options', () => {
      render(<Select options={mockOptions} />);
      const select = screen.getByRole('combobox');
      const options = Array.from(select.querySelectorAll('option'));

      expect(options).toHaveLength(mockOptions.length);
      options.forEach((option, index) => {
        expect(option.value).toBe(mockOptions[index].value);
        expect(option.textContent).toBe(mockOptions[index].label);
      });
    });
  });

  describe('Styling', () => {
    it('applies error styling when error prop is provided', () => {
      render(<Select options={mockOptions} error="Error" />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('border-red-500');
    });

    it('applies custom className', () => {
      render(<Select options={mockOptions} className="custom-class" />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('custom-class');
    });

    it('applies disabled styling when disabled', () => {
      render(<Select options={mockOptions} disabled />);
      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
      expect(select).toHaveClass('disabled:opacity-50');
    });

    it('has appearance-none class for custom dropdown arrow', () => {
      render(<Select options={mockOptions} />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('appearance-none');
    });

    it('has inline style for custom dropdown arrow', () => {
      render(<Select options={mockOptions} />);
      const select = screen.getByRole('combobox');
      // Check that inline styles are applied for the custom dropdown arrow
      expect(select).toHaveAttribute('style');
      const style = select.getAttribute('style');
      // JSDOM may strip data URIs, so check for other background properties
      expect(style).toMatch(/background-(repeat|position|size)/);
    });
  });

  describe('Accessibility', () => {
    it('has correct aria-invalid when error is present', () => {
      render(<Select options={mockOptions} error="Error message" />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-invalid', 'true');
    });

    it('has correct aria-invalid when no error', () => {
      render(<Select options={mockOptions} />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-invalid', 'false');
    });

    it('has aria-describedby pointing to error when error exists', () => {
      render(
        <Select
          label="Test Field"
          options={mockOptions}
          error="Error message"
        />
      );
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-describedby', 'test-field-error');
    });

    it('has aria-describedby pointing to helper text when provided', () => {
      render(
        <Select
          label="Test Field"
          options={mockOptions}
          helperText="Helper text"
        />
      );
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-describedby', 'test-field-helper');
    });

    it('error message has role="alert"', () => {
      render(<Select options={mockOptions} error="Error message" />);
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('Error message');
    });
  });

  describe('User Interaction', () => {
    it('calls onChange handler when user selects an option', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<Select options={mockOptions} onChange={handleChange} />);
      const select = screen.getByRole('combobox');

      await user.selectOptions(select, 'option1');
      expect(handleChange).toHaveBeenCalled();
    });

    it('updates value when controlled', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('');
        return (
          <Select
            options={mockOptions}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
      };

      const user = userEvent.setup();
      render(<TestComponent />);
      const select = screen.getByRole('combobox') as HTMLSelectElement;

      await user.selectOptions(select, 'option2');
      expect(select.value).toBe('option2');
    });

    it('cannot be changed when disabled', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<Select options={mockOptions} disabled onChange={handleChange} />);
      const select = screen.getByRole('combobox');

      await user.selectOptions(select, 'option1');
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('shows selected option text', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('');
        return (
          <Select
            options={mockOptions}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
      };

      const user = userEvent.setup();
      render(<TestComponent />);
      const select = screen.getByRole('combobox') as HTMLSelectElement;

      await user.selectOptions(select, 'option3');
      const selectedOption = screen.getByRole('option', {
        name: 'Option 3',
      }) as HTMLOptionElement;
      expect(selectedOption.selected).toBe(true);
    });
  });

  describe('Props Forwarding', () => {
    it('forwards HTML select attributes', () => {
      render(
        <Select
          options={mockOptions}
          autoComplete="off"
          data-testid="custom-select"
        />
      );
      const select = screen.getByRole('combobox');

      expect(select).toHaveAttribute('autoComplete', 'off');
      expect(select).toHaveAttribute('data-testid', 'custom-select');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLSelectElement>();
      render(<Select options={mockOptions} ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLSelectElement);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty options array gracefully', () => {
      render(<Select options={[]} />);
      const select = screen.getByRole('combobox');
      expect(select.querySelectorAll('option')).toHaveLength(0);
    });

    it('handles options with special characters', () => {
      const specialOptions = [
        { value: 'test-1', label: 'Option with - dash' },
        { value: 'test_2', label: 'Option with _ underscore' },
        { value: 'test 3', label: 'Option with space' },
      ];

      render(<Select options={specialOptions} />);
      const select = screen.getByRole('combobox');
      const options = Array.from(select.querySelectorAll('option'));

      expect(options).toHaveLength(specialOptions.length);
    });
  });
});
