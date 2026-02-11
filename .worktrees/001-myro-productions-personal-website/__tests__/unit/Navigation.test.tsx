import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Navigation from '@/components/ui/Navigation'

// Mock sections in the DOM
const setupSections = () => {
  const sections = ['home', 'services', 'portfolio', 'about', 'contact']
  sections.forEach((id) => {
    const section = document.createElement('section')
    section.id = id
    document.body.appendChild(section)
  })
}

const cleanupSections = () => {
  const sections = ['home', 'services', 'portfolio', 'about', 'contact']
  sections.forEach((id) => {
    const section = document.getElementById(id)
    if (section) {
      document.body.removeChild(section)
    }
  })
}

describe('Navigation Component', () => {
  // Suppress console errors from motion/react mock
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn((message, ...args) => {
      if (
        typeof message === 'string' &&
        (message.includes('layoutId') || message.includes('initial'))
      ) {
        return
      }
      originalError(message, ...args)
    })
  })

  afterAll(() => {
    console.error = originalError
  })

  beforeEach(() => {
    setupSections()
    // Reset body overflow
    document.body.style.overflow = ''
  })

  afterEach(() => {
    cleanupSections()
    // Reset body overflow after each test
    document.body.style.overflow = ''
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the navigation header', () => {
      render(<Navigation />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('renders the brand logo/name', () => {
      render(<Navigation />)
      expect(screen.getByText(/MYRO/i)).toBeInTheDocument()
    })

    it('renders all navigation links on desktop', () => {
      render(<Navigation />)
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Services')).toBeInTheDocument()
      expect(screen.getByText('Portfolio')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
    })

    it('renders mobile menu button', () => {
      render(<Navigation />)
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i })
      expect(menuButton).toBeInTheDocument()
    })
  })

  describe('Desktop Navigation', () => {
    it('has correct href attributes for all links', () => {
      render(<Navigation />)
      const links = screen.getAllByRole('link')

      // Brand link
      expect(links[0]).toHaveAttribute('href', '#home')

      // Nav links (Home, Services, Portfolio, Pricing, About, Contact)
      const navLinks = links.slice(1, 7) // Get the desktop nav links
      expect(navLinks[0]).toHaveAttribute('href', '#home')
      expect(navLinks[1]).toHaveAttribute('href', '#services')
      expect(navLinks[2]).toHaveAttribute('href', '#portfolio')
      expect(navLinks[3]).toHaveAttribute('href', '#pricing')
      expect(navLinks[4]).toHaveAttribute('href', '#about')
      expect(navLinks[5]).toHaveAttribute('href', '#contact')
    })

    it('handles navigation link clicks', async () => {
      const user = userEvent.setup()
      render(<Navigation />)

      const portfolioLink = screen.getAllByText('Portfolio')[0]
      await user.click(portfolioLink)

      expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
    })
  })

  describe('Mobile Menu', () => {
    it('mobile menu is closed by default', () => {
      render(<Navigation />)
      const mobileMenu = screen.queryByRole('navigation', { hidden: true })
      // The mobile menu should not be visible initially
      expect(screen.getByRole('button', { name: /open navigation menu/i })).toHaveAttribute('aria-expanded', 'false')
    })

    it('opens mobile menu when button is clicked', async () => {
      const user = userEvent.setup()
      render(<Navigation />)

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i })
      await user.click(menuButton)

      expect(menuButton).toHaveAttribute('aria-expanded', 'true')
      expect(menuButton).toHaveAttribute('aria-label', 'Close navigation menu')
    })

    it('closes mobile menu when button is clicked again', async () => {
      const user = userEvent.setup()
      render(<Navigation />)

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i })

      // Open
      await user.click(menuButton)
      expect(menuButton).toHaveAttribute('aria-expanded', 'true')

      // Close
      await user.click(menuButton)
      expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('closes mobile menu when navigation link is clicked', async () => {
      const user = userEvent.setup()
      render(<Navigation />)

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i })
      await user.click(menuButton)

      // Click on a link in the mobile menu
      const allServicesLinks = screen.getAllByText('Services')
      const mobileServicesLink = allServicesLinks[allServicesLinks.length - 1]
      await user.click(mobileServicesLink)

      // Menu should close
      await waitFor(() => {
        expect(menuButton).toHaveAttribute('aria-expanded', 'false')
      })
    })

    it('closes mobile menu on Escape key press', async () => {
      const user = userEvent.setup()
      render(<Navigation />)

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i })
      await user.click(menuButton)

      expect(menuButton).toHaveAttribute('aria-expanded', 'true')

      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(menuButton).toHaveAttribute('aria-expanded', 'false')
      })
    })
  })

  describe('Scroll Behavior', () => {
    it('adds background when scrolled', () => {
      render(<Navigation />)
      const header = screen.getByRole('banner')

      // Initially transparent
      expect(header).toHaveClass('bg-transparent')

      // Simulate scroll
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true })
      fireEvent.scroll(window)

      // Should have background now
      waitFor(() => {
        expect(header).toHaveClass('bg-carbon/80')
      })
    })
  })

  describe('Body Scroll Lock', () => {
    it('prevents body scroll when mobile menu is open', async () => {
      const user = userEvent.setup()

      render(<Navigation />)

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i })

      // Open menu
      await user.click(menuButton)

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden')
      })

      // Close menu
      await user.click(menuButton)

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('unset')
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper aria labels for brand link', () => {
      render(<Navigation />)
      const brandLink = screen.getByLabelText('Myro Productions Home')
      expect(brandLink).toBeInTheDocument()
    })

    it('mobile menu button has proper aria attributes', () => {
      render(<Navigation />)
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i })
      expect(menuButton).toHaveAttribute('aria-expanded')
      expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu')
    })

    it('marks active section with aria-current', () => {
      render(<Navigation />)
      // The first link (Home) should be active by default
      const links = screen.getAllByRole('link')
      // Check if any link has aria-current="page"
      const activeLink = links.find(link => link.getAttribute('aria-current') === 'page')
      expect(activeLink).toBeDefined()
    })
  })
})
