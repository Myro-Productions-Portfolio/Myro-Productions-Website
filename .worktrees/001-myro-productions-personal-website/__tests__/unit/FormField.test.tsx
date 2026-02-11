import { render, screen } from '@testing-library/react'
import FormField from '@/components/ui/FormField'
import Input from '@/components/ui/Input'

describe('FormField', () => {
  it('renders label with required indicator', () => {
    render(
      <FormField label="Email" name="email" required>
        <Input name="email" type="email" />
      </FormField>
    )

    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders validation checkmark when isValid is true', () => {
    const { container } = render(
      <FormField label="Email" name="email" isValid>
        <Input name="email" type="email" />
      </FormField>
    )

    const checkmark = container.querySelector('svg')
    expect(checkmark).toBeInTheDocument()
    
    const checkmarkContainer = container.querySelector('.text-moss-600')
    expect(checkmarkContainer).toBeInTheDocument()
  })

  it('renders error message when error is provided', () => {
    render(
      <FormField label="Email" name="email" error="Email is required">
        <Input name="email" type="email" />
      </FormField>
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Email is required')
  })

  it('renders helper text when no error is present', () => {
    render(
      <FormField label="Email" name="email" helperText="Enter your email address">
        <Input name="email" type="email" />
      </FormField>
    )

    expect(screen.getByText('Enter your email address')).toBeInTheDocument()
  })

  it('does not render helper text when error is present', () => {
    render(
      <FormField
        label="Email"
        name="email"
        error="Email is required"
        helperText="Enter your email address"
      >
        <Input name="email" type="email" />
      </FormField>
    )

    expect(screen.queryByText('Enter your email address')).not.toBeInTheDocument()
    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })

  it('does not render checkmark when isValid is false', () => {
    const { container } = render(
      <FormField label="Email" name="email" isValid={false}>
        <Input name="email" type="email" />
      </FormField>
    )

    const checkmark = container.querySelector('svg')
    expect(checkmark).not.toBeInTheDocument()
  })

  it('applies custom className to wrapper', () => {
    const { container } = render(
      <FormField label="Email" name="email" className="custom-class">
        <Input name="email" type="email" />
      </FormField>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('custom-class')
  })
})
