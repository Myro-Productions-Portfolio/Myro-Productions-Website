import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '@/components/ui/Input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders input field without label', () => {
      render(<Input placeholder="Test input" />);
      const input = screen.getByPlaceholderText('Test input');
      expect(input).toBeInTheDocument();
    });

    it('renders input field with label', () => {
      render(<Input label="Test Label" />);
      const label = screen.getByText('Test Label');
      const input = screen.getByLabelText('Test Label');
      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });

    it('displays required indicator when required prop is true', () => {
      render(<Input label="Test Label" required />);
      const requiredIndicator = screen.getByText('*');
      expect(requiredIndicator).toBeInTheDocument();
      expect(requiredIndicator).toHaveClass('text-accent');
    });

    it('displays helper text when provided', () => {
      render(<Input label="Test" helperText="This is helper text" />);
      const helperText = screen.getByText('This is helper text');
      expect(helperText).toBeInTheDocument();
    });

    it('displays error message when error prop is provided', () => {
      render(<Input label="Test" error="This field is required" />);
      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('text-red-500');
    });

    it('prioritizes error message over helper text', () => {
      render(
        <Input
          label="Test"
          error="Error message"
          helperText="Helper text"
        />
      );
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies error styling when error prop is provided', () => {
      render(<Input error="Error" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
    });

    it('applies custom className', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('applies disabled styling when disabled', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:opacity-50');
    });
  });

  describe('Accessibility', () => {
    it('has correct aria-invalid when error is present', () => {
      render(<Input error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('has correct aria-invalid when no error', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('has aria-describedby pointing to error when error exists', () => {
      render(<Input label="Test Field" error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-field-error');
    });

    it('has aria-describedby pointing to helper text when provided', () => {
      render(<Input label="Test Field" helperText="Helper text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-field-helper');
    });

    it('error message has role="alert"', () => {
      render(<Input error="Error message" />);
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('Error message');
    });
  });

  describe('User Interaction', () => {
    it('calls onChange handler when user types', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'test');
      expect(handleChange).toHaveBeenCalled();
    });

    it('updates value when controlled', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('');
        return (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
      };

      const user = userEvent.setup();
      render(<TestComponent />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      await user.type(input, 'test value');
      expect(input.value).toBe('test value');
    });

    it('cannot be edited when disabled', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<Input disabled onChange={handleChange} />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'test');
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Props Forwarding', () => {
    it('forwards HTML input attributes', () => {
      render(
        <Input
          type="email"
          placeholder="Enter email"
          maxLength={50}
          autoComplete="email"
        />
      );
      const input = screen.getByRole('textbox');

      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('placeholder', 'Enter email');
      expect(input).toHaveAttribute('maxLength', '50');
      expect(input).toHaveAttribute('autoComplete', 'email');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });
});
