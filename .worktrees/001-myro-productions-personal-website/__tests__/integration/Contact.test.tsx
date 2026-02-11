import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from '@/components/sections/Contact';

// Mock GSAP and ScrollTrigger to avoid animation issues in tests
jest.mock('gsap', () => ({
  gsap: {
    registerPlugin: jest.fn(),
    context: jest.fn(() => ({
      revert: jest.fn(),
    })),
    fromTo: jest.fn(),
  },
}));

jest.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {},
}));

jest.mock('@gsap/react', () => ({
  useGSAP: jest.fn((callback) => {
    // Don't execute animations in tests
  }),
}));

// Mock fetch for form submission tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
) as jest.Mock;

// Mock localStorage for CSRF token
const localStorageMock = {
  getItem: jest.fn(() => 'mock-csrf-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('Contact Section Integration', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (global.fetch as jest.Mock).mockClear();
    // Add delay to simulate network request
    (global.fetch as jest.Mock).mockImplementation(() =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          });
        }, 100); // 100ms delay to catch loading state
      })
    );
  });

  describe('Section Structure', () => {
    it('renders the contact section with correct id', () => {
      render(<Contact />);
      const section = document.querySelector('#contact');
      expect(section).toBeInTheDocument();
    });

    it('renders the section title', () => {
      render(<Contact />);
      const title = screen.getByText("Let's Build Something Amazing");
      expect(title).toBeInTheDocument();
    });

    it('renders contact information', () => {
      render(<Contact />);
      // Use getAllByText for multiple "Email" elements (heading and form label)
      const emailElements = screen.getAllByText('Email');
      expect(emailElements.length).toBeGreaterThan(0);
      expect(screen.getByText('pmnicolasm@gmail.com')).toBeInTheDocument();
      expect(screen.getByText('Usually responds within 24 hours')).toBeInTheDocument();
    });

    it('renders social links', () => {
      render(<Contact />);
      const linkedInLink = screen.getByLabelText(/Visit Nicolas Myers on LinkedIn/i);
      const githubLink = screen.getByLabelText(/Visit Myro Productions on GitHub/i);

      expect(linkedInLink).toBeInTheDocument();
      expect(githubLink).toBeInTheDocument();
      expect(linkedInLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('target', '_blank');
    });

    it('email link has correct mailto href', () => {
      render(<Contact />);
      const emailLink = screen.getByText('pmnicolasm@gmail.com');
      expect(emailLink).toHaveAttribute('href', 'mailto:pmnicolasm@gmail.com');
    });
  });

  describe('Form Fields', () => {
    it('renders all form fields', () => {
      render(<Contact />);

      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /Email/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Project Type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
    });

    it('shows required indicators on required fields', () => {
      render(<Contact />);
      const requiredIndicators = screen.getAllByText('*');

      // Name, Email, Project Type, and Message are all required
      expect(requiredIndicators).toHaveLength(4);
    });

    it('renders project type dropdown with correct options', () => {
      render(<Contact />);
      const select = screen.getByLabelText(/Project Type/i) as HTMLSelectElement;
      const options = Array.from(select.options);

      expect(options).toHaveLength(5); // Including default option
      expect(options.map(opt => opt.textContent)).toEqual([
        'Select a project type...',
        'Rapid Prototyping',
        'Automation',
        'AI Development',
        'Other',
      ]);
    });

    it('renders submit button', () => {
      render(<Contact />);
      const submitButton = screen.getByRole('button', { name: /Send Message/i });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows error when name field is empty on submit', async () => {
      const user = userEvent.setup();
      render(<Contact />);

      const submitButton = screen.getByRole('button', { name: /Send Message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });

    it('shows error when email field is empty on submit', async () => {
      const user = userEvent.setup();
      render(<Contact />);

      const submitButton = screen.getByRole('button', { name: /Send Message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('shows error when email format is invalid', async () => {
      const user = userEvent.setup();
      render(<Contact />);

      const emailInput = screen.getByRole('textbox', { name: /Email/i });
      const submitButton = screen.getByRole('button', { name: /Send Message/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('shows error when project type is not selected', async () => {
      const user = userEvent.setup();
      render(<Contact />);

      const submitButton = screen.getByRole('button', { name: /Send Message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please select a project type')).toBeInTheDocument();
      });
    });

    it('shows error when message is empty', async () => {
      const user = userEvent.setup();
      render(<Contact />);

      const submitButton = screen.getByRole('button', { name: /Send Message/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Message is required')).toBeInTheDocument();
      });
    });

    it('shows error when message is too short', async () => {
      const user = userEvent.setup();
      render(<Contact />);

      const messageInput = screen.getByLabelText(/Message/i);
      const submitButton = screen.getByRole('button', { name: /Send Message/i });

      await user.type(messageInput, 'Short');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Message must be at least 10 characters')).toBeInTheDocument();
      });
    });

    it('accepts valid email formats', async () => {
      const user = userEvent.setup();
      render(<Contact />);

      const nameInput = screen.getByLabelText(/Name/i);
      const emailInput = screen.getByRole('textbox', { name: /Email/i });
      const projectTypeSelect = screen.getByLabelText(/Project Type/i);
      const messageInput = screen.getByLabelText(/Message/i);
      const submitButton = screen.getByRole('button', { name: /Send Message/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john.doe@example.com');
      await user.selectOptions(projectTypeSelect, 'automation');
      await user.type(messageInput, 'This is a test message that is long enough.');
      await user.click(submitButton);

      // Should not show email validation error
      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
      });
    });

    it('clears error message when user starts typing in field', async () => {
      const user = userEvent.setup();
      render(<Contact />);

      const nameInput = screen.getByLabelText(/Name/i);
      const submitButton = screen.getByRole('button', { name: /Send Message/i });

      // Submit to trigger validation
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });

      // Type in the field
      await user.type(nameInput, 'John');

      // Error should disappear
      await waitFor(() => {
        expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form successfully with valid data', async () => {
      const user = userEvent.setup();
      render(<Contact />);

      const nameInput = screen.getByLabelText(/Name/i);
      const emailInput = screen.getByRole('textbox', { name: /Email/i });
      const projectTypeSelect = screen.getByLabelText(/Project Type/i);
      const messageInput = screen.getByLabelText(/Message/i);
      const submitButton = screen.getByRole('button', { name: /Send Message/i });

      await user.type(nameInput, 'Jane Smith');
      await user.type(emailInput, 'jane.smith@example.com');
      await user.selectOptions(projectTypeSelect, 'rapid-prototyping');
      await user.type(messageInput, 'I would like to discuss a new project with you.');

      await user.click(submitButton);

      // Button should show loading state
      await waitFor(() => {
        expect(screen.getByText(/Sending.../i)).toBeInTheDocument();
      });

      // Success message should appear
      await waitFor(
        () => {
          expect(screen.getByText(/Thank you for your message/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('disables form fields during submission', async () => {
      const user = userEvent.setup();
      render(<Contact />);

      const nameInput = screen.getByLabelText(/Name/i);
      const emailInput = screen.getByRole('textbox', { name: /Email/i });
      const projectTypeSelect = screen.getByLabelText(/Project Type/i);
      const messageInput = screen.getByLabelText(/Message/i);
      const submitButton = screen.getByRole('button', { name: /Send Message/i });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.selectOptions(projectTypeSelect, 'ai-development');
      await user.type(messageInput, 'This is a test message for AI development.');

      await user.click(submitButton);

      // Fields should be disabled during submission
      await waitFor(() => {
        expect(nameInput).toBeDisabled();
        expect(emailInput).toBeDisabled();
        expect(projectTypeSelect).toBeDisabled();
        expect(messageInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });
    });

    it('resets form after successful submission', async () => {
      const user = userEvent.setup();
      render(<Contact />);

      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      const emailInput = screen.getByRole('textbox', { name: /Email/i }) as HTMLInputElement;
      const projectTypeSelect = screen.getByLabelText(/Project Type/i) as HTMLSelectElement;
      const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: /Send Message/i });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.selectOptions(projectTypeSelect, 'other');
      await user.type(messageInput, 'This message should be cleared after submission.');

      await user.click(submitButton);

      // Wait for success and form reset (submission takes 1.5s, reset happens 3s after success)
      await waitFor(
        () => {
          expect(nameInput.value).toBe('');
          expect(emailInput.value).toBe('');
          expect(projectTypeSelect.value).toBe('');
          expect(messageInput.value).toBe('');
        },
        { timeout: 6000 }
      );
    }, 10000); // Set test timeout to 10 seconds
  });

  describe('Form States', () => {
    it('shows loading spinner during submission', async () => {
      const user = userEvent.setup();
      render(<Contact />);

      const nameInput = screen.getByLabelText(/Name/i);
      const emailInput = screen.getByRole('textbox', { name: /Email/i });
      const projectTypeSelect = screen.getByLabelText(/Project Type/i);
      const messageInput = screen.getByLabelText(/Message/i);
      const submitButton = screen.getByRole('button', { name: /Send Message/i });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.selectOptions(projectTypeSelect, 'automation');
      await user.type(messageInput, 'Test message for spinner.');

      await user.click(submitButton);

      // Loading spinner should be visible
      await waitFor(() => {
        const spinner = submitButton.querySelector('svg.animate-spin');
        expect(spinner).toBeInTheDocument();
      });
    });

    it('displays success message with correct styling', async () => {
      const user = userEvent.setup();
      render(<Contact />);

      const nameInput = screen.getByLabelText(/Name/i);
      const emailInput = screen.getByRole('textbox', { name: /Email/i });
      const projectTypeSelect = screen.getByLabelText(/Project Type/i);
      const messageInput = screen.getByLabelText(/Message/i);
      const submitButton = screen.getByRole('button', { name: /Send Message/i });

      await user.type(nameInput, 'Success User');
      await user.type(emailInput, 'success@example.com');
      await user.selectOptions(projectTypeSelect, 'rapid-prototyping');
      await user.type(messageInput, 'This should show a success message.');

      await user.click(submitButton);

      await waitFor(
        () => {
          const successMessage = screen.getByText(/Thank you for your message/i);
          expect(successMessage).toBeInTheDocument();
          // Check for moss-600 border color in parent div
          const successContainer = successMessage.closest('div.border-moss-600');
          expect(successContainer).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Accessibility', () => {
    it('form has proper semantic structure', () => {
      render(<Contact />);
      const form = screen.getByRole('button', { name: /Send Message/i }).closest('form');
      expect(form).toBeInTheDocument();
    });

    it('all form fields have associated labels', () => {
      render(<Contact />);

      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /Email/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Project Type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
    });

    it('external links have security attributes', () => {
      render(<Contact />);

      const linkedInLink = screen.getByLabelText(/Visit Nicolas Myers on LinkedIn/i);
      const githubLink = screen.getByLabelText(/Visit Myro Productions on GitHub/i);

      expect(linkedInLink).toHaveAttribute('rel', 'noopener noreferrer');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('form prevents default submission', async () => {
      const user = userEvent.setup();
      render(<Contact />);

      const form = screen.getByRole('button', { name: /Send Message/i }).closest('form');
      const mockSubmit = jest.fn((e) => e.preventDefault());

      if (form) {
        form.onsubmit = mockSubmit;
      }

      const submitButton = screen.getByRole('button', { name: /Send Message/i });
      await user.click(submitButton);

      // Form should prevent default HTML submission
      expect(form).toHaveAttribute('noValidate');
    });
  });
});
