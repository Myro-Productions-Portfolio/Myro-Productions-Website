import { render, screen } from '@testing-library/react'
import ServiceCard, { type ServiceCardProps } from '@/components/ui/ServiceCard'
import RocketIcon from '@/components/icons/RocketIcon'

describe('ServiceCard', () => {
  const mockProps: ServiceCardProps = {
    icon: <RocketIcon />,
    title: 'Test Service',
    description: 'This is a test service description',
    benefits: [
      'First benefit',
      'Second benefit',
      'Third benefit',
    ],
  }

  it('renders without crashing', () => {
    render(<ServiceCard {...mockProps} />)
    expect(screen.getByTestId('service-card')).toBeInTheDocument()
  })

  it('renders the title correctly', () => {
    render(<ServiceCard {...mockProps} />)
    expect(screen.getByRole('heading', { name: 'Test Service' })).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<ServiceCard {...mockProps} />)
    expect(screen.getByText('This is a test service description')).toBeInTheDocument()
  })

  it('renders all benefits', () => {
    render(<ServiceCard {...mockProps} />)

    expect(screen.getByText('First benefit')).toBeInTheDocument()
    expect(screen.getByText('Second benefit')).toBeInTheDocument()
    expect(screen.getByText('Third benefit')).toBeInTheDocument()
  })

  it('renders the correct number of benefits', () => {
    render(<ServiceCard {...mockProps} />)

    const benefitsList = screen.getByLabelText('Test Service benefits')
    const benefitItems = benefitsList.querySelectorAll('li')

    expect(benefitItems).toHaveLength(3)
  })

  it('renders the icon', () => {
    const { container } = render(<ServiceCard {...mockProps} />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<ServiceCard {...mockProps} />)

    // Check for benefits list label
    expect(screen.getByLabelText('Test Service benefits')).toBeInTheDocument()
  })

  it('applies hover classes correctly', () => {
    const { container } = render(<ServiceCard {...mockProps} />)

    const card = screen.getByTestId('service-card')

    // Check for hover transition classes
    expect(card.className).toContain('hover:border-moss-600')
    // Note: The translate animation is handled by GSAP on mouseEnter/mouseLeave,
    // not via CSS classes, so we check for other hover-related classes
    expect(card.className).toContain('hover:shadow-')
  })

  it('renders with different props', () => {
    const differentProps: ServiceCardProps = {
      icon: <RocketIcon />,
      title: 'Different Service',
      description: 'Different description',
      benefits: ['Only one benefit'],
    }

    render(<ServiceCard {...differentProps} />)

    expect(screen.getByRole('heading', { name: 'Different Service' })).toBeInTheDocument()
    expect(screen.getByText('Different description')).toBeInTheDocument()
    expect(screen.getByText('Only one benefit')).toBeInTheDocument()
  })

  it('handles empty benefits array gracefully', () => {
    const propsWithNoBenefits: ServiceCardProps = {
      ...mockProps,
      benefits: [],
    }

    render(<ServiceCard {...propsWithNoBenefits} />)

    const benefitsList = screen.getByLabelText('Test Service benefits')
    const benefitItems = benefitsList.querySelectorAll('li')

    expect(benefitItems).toHaveLength(0)
  })
})
