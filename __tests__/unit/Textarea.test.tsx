import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Textarea from '@/components/ui/Textarea';

describe('Textarea Component', () => {
  describe('Rendering', () => {
    it('renders textarea field without label', () => {
      render(<Textarea placeholder="Test textarea" />);
      const textarea = screen.getByPlaceholderText('Test textarea');
      expect(textarea).toBeInTheDocument();
    });

    it('renders textarea field with label', () => {
      render(<Textarea label="Message" />);
      const label = screen.getByText('Message');
      const textarea = screen.getByLabelText('Message');
      expect(label).toBeInTheDocument();
      expect(textarea).toBeInTheDocument();
    });

    it('displays required indicator when required prop is true', () => {
      render(<Textarea label="Message" required />);
      const requiredIndicator = screen.getByText('*');
      expect(requiredIndicator).toBeInTheDocument();
      expect(requiredIndicator).toHaveClass('text-accent');
    });

    it('displays helper text when provided', () => {
      render(<Textarea label="Message" helperText="Max 500 characters" />);
      const helperText = screen.getByText('Max 500 characters');
      expect(helperText).toBeInTheDocument();
    });

    it('displays error message when error prop is provided', () => {
      render(<Textarea label="Message" error="Message is required" />);
      const errorMessage = screen.getByText('Message is required');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('text-red-500');
    });

    it('renders with custom rows attribute', () => {
      render(<Textarea rows={10} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '10');
    });

    it('renders with default rows of 5', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '5');
    });
  });

  describe('Styling', () => {
    it('applies error styling when error prop is provided', () => {
      render(<Textarea error="Error" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('border-red-500');
    });

    it('applies custom className', () => {
      render(<Textarea className="custom-class" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('custom-class');
    });

    it('applies disabled styling when disabled', () => {
      render(<Textarea disabled />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
      expect(textarea).toHaveClass('disabled:opacity-50');
    });

    it('has resize-vertical class for vertical resizing', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('resize-vertical');
    });
  });

  describe('Accessibility', () => {
    it('has correct aria-invalid when error is present', () => {
      render(<Textarea error="Error message" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('has correct aria-invalid when no error', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'false');
    });

    it('has aria-describedby pointing to error when error exists', () => {
      render(<Textarea label="Message" error="Error message" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'message-error');
    });

    it('has aria-describedby pointing to helper text when provided', () => {
      render(<Textarea label="Message" helperText="Helper text" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'message-helper');
    });

    it('error message has role="alert"', () => {
      render(<Textarea error="Error message" />);
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('Error message');
    });
  });

  describe('User Interaction', () => {
    it('calls onChange handler when user types', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<Textarea onChange={handleChange} />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'test message');
      expect(handleChange).toHaveBeenCalled();
    });

    it('updates value when controlled', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('');
        return (
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
      };

      const user = userEvent.setup();
      render(<TestComponent />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

      await user.type(textarea, 'test message');
      expect(textarea.value).toBe('test message');
    });

    it('cannot be edited when disabled', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<Textarea disabled onChange={handleChange} />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'test');
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('allows multiline text input', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('');
        return (
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
      };

      const user = userEvent.setup();
      render(<TestComponent />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

      await user.type(textarea, 'Line 1{Enter}Line 2{Enter}Line 3');
      expect(textarea.value).toContain('\n');
      expect(textarea.value.split('\n')).toHaveLength(3);
    });
  });

  describe('Props Forwarding', () => {
    it('forwards HTML textarea attributes', () => {
      render(
        <Textarea
          placeholder="Enter your message"
          maxLength={500}
          autoComplete="off"
        />
      );
      const textarea = screen.getByRole('textbox');

      expect(textarea).toHaveAttribute('placeholder', 'Enter your message');
      expect(textarea).toHaveAttribute('maxLength', '500');
      expect(textarea).toHaveAttribute('autoComplete', 'off');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });
  });
});
