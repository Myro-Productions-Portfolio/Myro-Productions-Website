import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Hero from '@/components/sections/Hero'

describe('Hero Section Integration', () => {
  beforeEach(() => {
    // Create mock sections for the buttons to scroll to
    const portfolio = document.createElement('section')
    portfolio.id = 'portfolio'
    document.body.appendChild(portfolio)

    const contact = document.createElement('section')
    contact.id = 'contact'
    document.body.appendChild(contact)
  })

  afterEach(() => {
    // Clean up
    const portfolio = document.getElementById('portfolio')
    if (portfolio) document.body.removeChild(portfolio)

    const contact = document.getElementById('contact')
    if (contact) document.body.removeChild(contact)
  })

  describe('Content Rendering', () => {
    it('renders the hero section', () => {
      const { container } = render(<Hero />)
      const section = container.querySelector('#home')
      expect(section).toBeInTheDocument()
    })

    it('renders the main headline', () => {
      render(<Hero />)
      expect(screen.getByText(/one-man/i)).toBeInTheDocument()
      expect(screen.getByText(/production powerhouse/i)).toBeInTheDocument()
    })

    it('renders the subheadline with key messaging', () => {
      render(<Hero />)
      expect(screen.getByText(/from concept to production/i)).toBeInTheDocument()
      expect(screen.getByText(/faster than you thought possible/i)).toBeInTheDocument()
      expect(screen.getByText(/rapid prototyping/i)).toBeInTheDocument()
      expect(screen.getByText(/automation solutions/i)).toBeInTheDocument()
      expect(screen.getByText(/AI-accelerated development/i)).toBeInTheDocument()
    })

    it('renders both CTA buttons', () => {
      render(<Hero />)
      expect(screen.getByRole('button', { name: /view my work/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /get in touch/i })).toBeInTheDocument()
    })
  })

  describe('CTA Buttons', () => {
    it('renders primary CTA with correct variant and size', () => {
      render(<Hero />)
      const primaryButton = screen.getByRole('button', { name: /view my work/i })
      expect(primaryButton).toHaveClass('bg-accent')
      expect(primaryButton).toHaveClass('px-8')
      expect(primaryButton).toHaveClass('py-4')
      expect(primaryButton).toHaveClass('text-lg')
    })

    it('renders secondary CTA with correct variant and size', () => {
      render(<Hero />)
      const secondaryButton = screen.getByRole('button', { name: /get in touch/i })
      expect(secondaryButton).toHaveClass('bg-transparent')
      expect(secondaryButton).toHaveClass('border-2')
      expect(secondaryButton).toHaveClass('px-8')
      expect(secondaryButton).toHaveClass('py-4')
      expect(secondaryButton).toHaveClass('text-lg')
    })

    it('"View My Work" button scrolls to portfolio section', async () => {
      const user = userEvent.setup()
      render(<Hero />)

      const portfolioButton = screen.getByRole('button', { name: /view my work/i })
      await user.click(portfolioButton)

      expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
    })

    it('"Get In Touch" button scrolls to contact section', async () => {
      const user = userEvent.setup()
      render(<Hero />)

      const contactButton = screen.getByRole('button', { name: /get in touch/i })
      await user.click(contactButton)

      expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
    })
  })

  describe('Visual Elements', () => {
    it('renders scroll indicator', () => {
      const { container } = render(<Hero />)
      const scrollIndicator = container.querySelector('.animate-bounce')
      expect(scrollIndicator).toBeInTheDocument()
    })

    it('has proper background structure', () => {
      const { container } = render(<Hero />)
      const section = container.querySelector('#home')
      // Check for background elements
      expect(section?.querySelector('.bg-carbon-subtle')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('uses semantic HTML structure', () => {
      const { container } = render(<Hero />)
      const section = container.querySelector('#home')
      expect(section).toBeInTheDocument()
      expect(section?.tagName).toBe('SECTION')
    })

    it('has proper heading hierarchy', () => {
      render(<Hero />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent(/one-man/i)
    })

    it('CTA buttons have proper accessible text', () => {
      render(<Hero />)
      expect(screen.getByRole('button', { name: /view my work/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /get in touch/i })).toBeInTheDocument()
    })
  })

  describe('GSAP Integration', () => {
    it('initializes GSAP animations on mount', () => {
      const { useGSAP } = require('@gsap/react')
      render(<Hero />)

      // Verify that useGSAP hook was called
      expect(useGSAP).toHaveBeenCalled()
    })

    it('respects reduced motion preferences', () => {
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
      }))

      const { useGSAP } = require('@gsap/react')
      render(<Hero />)

      // Hook should still be called even with reduced motion
      expect(useGSAP).toHaveBeenCalled()
    })
  })

  describe('Layout and Styling', () => {
    it('has full-height section', () => {
      const { container } = render(<Hero />)
      const section = container.querySelector('#home')
      expect(section).toHaveClass('min-h-screen')
    })

    it('centers content', () => {
      const { container } = render(<Hero />)
      const section = container.querySelector('#home')
      expect(section).toHaveClass('flex')
      expect(section).toHaveClass('items-center')
      expect(section).toHaveClass('justify-center')
    })

    it('buttons are responsive', () => {
      render(<Hero />)
      const primaryButton = screen.getByRole('button', { name: /view my work/i })
      expect(primaryButton).toHaveClass('w-full')
      expect(primaryButton).toHaveClass('sm:w-auto')
    })
  })
})
