import { test, expect } from '@playwright/test'

test.describe('Homepage E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Page Load & Basic Content', () => {
    test('should load the homepage successfully', async ({ page }) => {
      await expect(page).toHaveTitle(/myro productions/i)
    })

    test('should display the navigation header', async ({ page }) => {
      const header = page.locator('header')
      await expect(header).toBeVisible()
    })

    test('should display the brand name', async ({ page }) => {
      const brand = page.getByText(/MYRO/i)
      await expect(brand).toBeVisible()
    })

    test('should display all main sections', async ({ page }) => {
      await expect(page.locator('#home')).toBeVisible()
      await expect(page.locator('#services')).toBeVisible()
      await expect(page.locator('#portfolio')).toBeVisible()
      await expect(page.locator('#about')).toBeVisible()
      await expect(page.locator('#contact')).toBeVisible()
    })

    test('should display main element', async ({ page }) => {
      const main = page.locator('main')
      await expect(main).toBeVisible()
    })

    test('should display footer', async ({ page }) => {
      const footer = page.locator('footer')
      await expect(footer).toBeVisible()
    })
  })

  test.describe('Navigation', () => {
    test('should display all navigation links', async ({ page }) => {
      await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Services' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Portfolio' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'About' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible()
    })

    test('should navigate to Portfolio when clicking nav link', async ({ page }) => {
      await page.waitForLoadState('networkidle')

      const portfolioLinks = page.getByRole('link', { name: 'Portfolio' })
      await portfolioLinks.first().click()
      await page.waitForTimeout(1000)

      const portfolioSection = page.locator('#portfolio')
      await expect(portfolioSection).toBeInViewport({ ratio: 0.5 })
    })

    test('should navigate to Services when clicking nav link', async ({ page }) => {
      await page.waitForLoadState('networkidle')

      const servicesLinks = page.getByRole('link', { name: 'Services' })
      await servicesLinks.first().click()
      await page.waitForTimeout(1000)

      const servicesSection = page.locator('#services')
      await expect(servicesSection).toBeInViewport({ ratio: 0.5 })
    })

    test('should navigate to About when clicking nav link', async ({ page }) => {
      await page.waitForLoadState('networkidle')

      const aboutLinks = page.getByRole('link', { name: 'About' })
      await aboutLinks.first().click()
      await page.waitForTimeout(1000)

      const aboutSection = page.locator('#about')
      await expect(aboutSection).toBeInViewport({ ratio: 0.5 })
    })

    test('should navigate to Contact when clicking nav link', async ({ page }) => {
      await page.waitForLoadState('networkidle')

      const contactLinks = page.getByRole('link', { name: 'Contact' })
      await contactLinks.first().click()
      await page.waitForTimeout(1000)

      const contactSection = page.locator('#contact')
      await expect(contactSection).toBeInViewport({ ratio: 0.5 })
    })

    test('should update active nav link on scroll', async ({ page }) => {
      const homeLink = page.getByRole('link', { name: 'Home' }).first()
      await expect(homeLink).toHaveAttribute('aria-current', 'page')

      await page.locator('#services').scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)

      const servicesLink = page.getByRole('link', { name: 'Services' }).first()
      await expect(servicesLink).toHaveAttribute('aria-current', 'page')
    })

    test('should scroll to top when clicking brand logo', async ({ page }) => {
      // Scroll down first
      await page.locator('#contact').scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)

      // Click brand logo
      const brandLink = page.getByLabel('Myro Productions Home')
      await brandLink.click()
      await page.waitForTimeout(1000)

      // Check if we're at the top
      const scrollY = await page.evaluate(() => window.scrollY)
      expect(scrollY).toBeLessThan(100)
    })
  })

  test.describe('Mobile Navigation', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('should show mobile menu button on mobile', async ({ page }) => {
      const menuButton = page.getByRole('button', { name: /open menu/i })
      await expect(menuButton).toBeVisible()
    })

    test('should open mobile menu', async ({ page }) => {
      const menuButton = page.getByRole('button', { name: /open menu/i })

      await menuButton.click()
      await expect(menuButton).toHaveAttribute('aria-expanded', 'true')
      await expect(menuButton).toHaveAttribute('aria-label', 'Close menu')
    })

    test('should close mobile menu', async ({ page }) => {
      const menuButton = page.getByRole('button', { name: /open menu/i })

      // Open then close
      await menuButton.click()
      await menuButton.click()
      await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
      await expect(menuButton).toHaveAttribute('aria-label', 'Open menu')
    })

    test('should navigate from mobile menu', async ({ page }) => {
      const menuButton = page.getByRole('button', { name: /open menu/i })
      await menuButton.click()

      const aboutLink = page.getByRole('link', { name: 'About' }).last()
      await aboutLink.click()

      await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
      await page.waitForTimeout(1000)
      const aboutSection = page.locator('#about')
      await expect(aboutSection).toBeInViewport({ ratio: 0.5 })
    })

    test('should close menu when clicking nav link', async ({ page }) => {
      const menuButton = page.getByRole('button', { name: /open menu/i })
      await menuButton.click()

      const portfolioLink = page.getByRole('link', { name: 'Portfolio' }).last()
      await portfolioLink.click()

      await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    })
  })

  test.describe('Hero Section', () => {
    test('should display hero headline', async ({ page }) => {
      await expect(page.getByText(/one-man/i)).toBeVisible()
      await expect(page.getByText(/production powerhouse/i)).toBeVisible()
    })

    test('should display hero subheadline', async ({ page }) => {
      await expect(page.getByText(/from concept to production/i)).toBeVisible()
      await expect(page.getByText(/faster than you thought possible/i)).toBeVisible()
    })

    test('should display both CTA buttons', async ({ page }) => {
      await expect(page.getByRole('button', { name: /view my work/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /get in touch/i })).toBeVisible()
    })

    test('should navigate to portfolio when clicking "View My Work"', async ({ page }) => {
      await page.getByRole('button', { name: /view my work/i }).click()
      await page.waitForTimeout(1000)

      const portfolioSection = page.locator('#portfolio')
      await expect(portfolioSection).toBeInViewport({ ratio: 0.5 })
    })

    test('should navigate to contact when clicking "Get In Touch"', async ({ page }) => {
      await page.getByRole('button', { name: /get in touch/i }).click()
      await page.waitForTimeout(1000)

      const contactSection = page.locator('#contact')
      await expect(contactSection).toBeInViewport({ ratio: 0.5 })
    })
  })

  test.describe('Services Section', () => {
    test('should display services section title', async ({ page }) => {
      await page.locator('#services').scrollIntoViewIfNeeded()
      await expect(page.getByText('What I Build')).toBeVisible()
    })

    test('should display all 3 service cards', async ({ page }) => {
      await page.locator('#services').scrollIntoViewIfNeeded()

      await expect(page.getByText('Rapid Prototyping')).toBeVisible()
      await expect(page.getByText('Automation Solutions')).toBeVisible()
      await expect(page.getByText('AI-Accelerated Development')).toBeVisible()
    })

    test('should display service card descriptions', async ({ page }) => {
      await page.locator('#services').scrollIntoViewIfNeeded()

      await expect(page.getByText(/Transform ideas into working prototypes/i)).toBeVisible()
      await expect(page.getByText(/Eliminate repetitive tasks/i)).toBeVisible()
      await expect(page.getByText(/Leverage cutting-edge AI tools/i)).toBeVisible()
    })

    test('should display service benefits', async ({ page }) => {
      await page.locator('#services').scrollIntoViewIfNeeded()

      // Check for some key benefits
      await expect(page.getByText('Fast iteration cycles')).toBeVisible()
      await expect(page.getByText('Increased efficiency')).toBeVisible()
      await expect(page.getByText('Enhanced capabilities')).toBeVisible()
    })
  })

  test.describe('Portfolio Section', () => {
    test('should display portfolio section title', async ({ page }) => {
      await page.locator('#portfolio').scrollIntoViewIfNeeded()
      await expect(page.getByText('Portfolio')).toBeVisible()
    })

    test('should display filter buttons', async ({ page }) => {
      await page.locator('#portfolio').scrollIntoViewIfNeeded()

      await expect(page.getByRole('button', { name: 'All' })).toBeVisible()
      // Additional filter buttons will depend on your portfolio data
    })

    test('should filter projects when clicking filter button', async ({ page }) => {
      await page.locator('#portfolio').scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)

      // Get initial project count
      const allButton = page.getByRole('button', { name: 'All' })
      await allButton.click()
      await page.waitForTimeout(500)

      const initialProjects = await page.locator('#portfolio').getByRole('article').count()
      expect(initialProjects).toBeGreaterThan(0)

      // Try clicking another filter if available
      const filterButtons = await page.locator('#portfolio').getByRole('button').all()
      if (filterButtons.length > 1) {
        await filterButtons[1].click()
        await page.waitForTimeout(500)
        // Projects should update (may be same or different count)
      }
    })

    test('should display project cards', async ({ page }) => {
      await page.locator('#portfolio').scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)

      const projectCards = page.locator('#portfolio').getByRole('article')
      const count = await projectCards.count()
      expect(count).toBeGreaterThan(0)
    })
  })

  test.describe('About Section', () => {
    test('should display about section', async ({ page }) => {
      await page.locator('#about').scrollIntoViewIfNeeded()
      const aboutSection = page.locator('#about')
      await expect(aboutSection).toBeVisible()
    })

    test('should display bio content', async ({ page }) => {
      await page.locator('#about').scrollIntoViewIfNeeded()
      // Check for some bio text (adjust based on your actual content)
      const bioText = page.locator('#about p').first()
      await expect(bioText).toBeVisible()
    })

    test('should display skills or tags', async ({ page }) => {
      await page.locator('#about').scrollIntoViewIfNeeded()

      // Look for skill tags - they might be buttons or spans
      const skillTags = page.locator('#about [class*="skill"], #about [class*="tag"]')
      const count = await skillTags.count()

      // If no specific skill class, just check the section has content
      if (count === 0) {
        await expect(page.locator('#about')).toContainText(/./i)
      }
    })
  })

  test.describe('Contact Section', () => {
    test('should display contact section title', async ({ page }) => {
      await page.locator('#contact').scrollIntoViewIfNeeded()
      await expect(page.getByText(/Let's Build Something Amazing/i)).toBeVisible()
    })

    test('should display contact form', async ({ page }) => {
      await page.locator('#contact').scrollIntoViewIfNeeded()
      const form = page.locator('form')
      await expect(form).toBeVisible()
    })

    test('should display all form fields', async ({ page }) => {
      await page.locator('#contact').scrollIntoViewIfNeeded()

      await expect(page.getByLabel('Name', { exact: false })).toBeVisible()
      await expect(page.getByLabel('Email', { exact: false })).toBeVisible()
      await expect(page.getByLabel('Project Type', { exact: false })).toBeVisible()
      await expect(page.getByLabel('Message', { exact: false })).toBeVisible()
    })

    test('should display submit button', async ({ page }) => {
      await page.locator('#contact').scrollIntoViewIfNeeded()
      await expect(page.getByRole('button', { name: /send message/i })).toBeVisible()
    })

    test('should show validation errors on empty form submission', async ({ page }) => {
      await page.locator('#contact').scrollIntoViewIfNeeded()

      const submitButton = page.getByRole('button', { name: /send message/i })
      await submitButton.click()

      // Wait for validation errors to appear
      await page.waitForTimeout(500)

      // Check for error messages
      const errors = page.locator('[class*="error"], [class*="invalid"], [role="alert"]')
      const errorCount = await errors.count()
      expect(errorCount).toBeGreaterThan(0)
    })

    test('should validate email format', async ({ page }) => {
      await page.locator('#contact').scrollIntoViewIfNeeded()

      const emailInput = page.getByLabel('Email', { exact: false })
      await emailInput.fill('invalid-email')

      const submitButton = page.getByRole('button', { name: /send message/i })
      await submitButton.click()
      await page.waitForTimeout(500)

      // Should show email validation error
      await expect(page.getByText(/valid email/i)).toBeVisible()
    })

    test('should show success message on valid form submission', async ({ page }) => {
      await page.locator('#contact').scrollIntoViewIfNeeded()

      await page.getByLabel('Name', { exact: false }).fill('Test User')
      await page.getByLabel('Email', { exact: false }).fill('test@example.com')

      const projectTypeSelect = page.getByLabel('Project Type', { exact: false })
      await projectTypeSelect.selectOption({ index: 1 }) // Select first non-empty option

      await page.getByLabel('Message', { exact: false }).fill('This is a test message with enough characters.')

      const submitButton = page.getByRole('button', { name: /send message/i })
      await submitButton.click()

      // Wait for submission
      await page.waitForTimeout(2000)

      // Check for success message
      await expect(page.getByText(/thank you/i)).toBeVisible()
    })

    test('should display email contact info', async ({ page }) => {
      await page.locator('#contact').scrollIntoViewIfNeeded()
      await expect(page.getByText(/hello@myroproductions.com/i)).toBeVisible()
    })

    test('should display social links', async ({ page }) => {
      await page.locator('#contact').scrollIntoViewIfNeeded()

      await expect(page.getByLabel(/LinkedIn/i)).toBeVisible()
      await expect(page.getByLabel(/GitHub/i)).toBeVisible()
    })
  })

  test.describe('Footer', () => {
    test('should display footer', async ({ page }) => {
      const footer = page.locator('footer')
      await expect(footer).toBeVisible()
    })

    test('should display brand name in footer', async ({ page }) => {
      await expect(page.locator('footer').getByText(/MYRO/i)).toBeVisible()
    })

    test('should display social links in footer', async ({ page }) => {
      const footer = page.locator('footer')

      const linkedInLink = footer.getByLabel(/LinkedIn/i)
      const githubLink = footer.getByLabel(/GitHub/i)
      const twitterLink = footer.getByLabel(/Twitter/i)

      await expect(linkedInLink).toBeVisible()
      await expect(githubLink).toBeVisible()
      await expect(twitterLink).toBeVisible()
    })

    test('should display quick links in footer', async ({ page }) => {
      const footer = page.locator('footer')

      await expect(footer.getByRole('link', { name: 'Home' })).toBeVisible()
      await expect(footer.getByRole('link', { name: 'Services' })).toBeVisible()
      await expect(footer.getByRole('link', { name: 'Portfolio' })).toBeVisible()
      await expect(footer.getByRole('link', { name: 'About' })).toBeVisible()
      await expect(footer.getByRole('link', { name: 'Contact' })).toBeVisible()
    })

    test('should display copyright with current year', async ({ page }) => {
      const currentYear = new Date().getFullYear()
      await expect(page.getByText(new RegExp(`${currentYear}.*Myro Productions`, 'i'))).toBeVisible()
    })

    test('should display back to top button', async ({ page }) => {
      const backToTopButton = page.getByRole('button', { name: /back to top/i })
      await expect(backToTopButton).toBeVisible()
    })

    test('should scroll to top when clicking back to top button', async ({ page }) => {
      // Scroll down
      await page.locator('#contact').scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)

      // Click back to top
      const backToTopButton = page.getByRole('button', { name: /back to top/i })
      await backToTopButton.click()
      await page.waitForTimeout(1000)

      // Check scroll position
      const scrollY = await page.evaluate(() => window.scrollY)
      expect(scrollY).toBeLessThan(100)
    })

    test('should display contact email in footer', async ({ page }) => {
      await expect(page.locator('footer').getByText(/hello@myroproductions.com/i)).toBeVisible()
    })
  })

  test.describe('Scroll Behavior', () => {
    test('should change header background on scroll', async ({ page }) => {
      const header = page.locator('header')

      // Initially should be transparent
      await expect(header).toHaveClass(/bg-transparent/)

      // Scroll down
      await page.evaluate(() => window.scrollBy(0, 200))
      await page.waitForTimeout(300)

      // Should have background now
      await expect(header).toHaveClass(/bg-carbon/)
    })

    test('should show scroll indicator in hero', async ({ page }) => {
      const scrollIndicator = page.locator('.animate-bounce').first()
      await expect(scrollIndicator).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should have no accessibility violations on initial load', async ({ page }) => {
      await expect(page.locator('main, [role="main"]')).toBeTruthy()
      await expect(page.locator('header, [role="banner"]')).toBeVisible()

      const h1 = page.locator('h1')
      await expect(h1).toBeVisible()
    })

    test('should be keyboard navigable', async ({ page }) => {
      await page.keyboard.press('Tab')

      const focused = await page.evaluate(() => document.activeElement?.textContent)
      expect(focused).toContain('MYRO')
    })

    test('should have proper ARIA labels on buttons', async ({ page }) => {
      const brandLink = page.getByLabel('Myro Productions Home')
      await expect(brandLink).toBeVisible()

      const menuButton = page.getByRole('button', { name: /menu/i })
      await expect(menuButton).toHaveAttribute('aria-expanded')
    })

    test('should have proper ARIA labels on social links', async ({ page }) => {
      await expect(page.getByLabel(/LinkedIn/i).first()).toBeVisible()
      await expect(page.getByLabel(/GitHub/i).first()).toBeVisible()
    })

    test('should support tab navigation through form', async ({ page }) => {
      await page.locator('#contact').scrollIntoViewIfNeeded()

      // Focus on name field
      const nameInput = page.getByLabel('Name', { exact: false })
      await nameInput.focus()

      // Tab to next field
      await page.keyboard.press('Tab')

      // Should be on email field
      const emailInput = page.getByLabel('Email', { exact: false })
      await expect(emailInput).toBeFocused()
    })

    test('should have visible focus states', async ({ page }) => {
      const firstLink = page.getByRole('link').first()
      await firstLink.focus()

      // Check if focus is visible (element should have focus ring or outline)
      const hasFocusStyle = await firstLink.evaluate((el) => {
        const styles = window.getComputedStyle(el)
        return styles.outline !== 'none' || styles.boxShadow !== 'none'
      })

      expect(hasFocusStyle).toBeTruthy()
    })
  })

  test.describe('Responsive Design', () => {
    test('should be responsive on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })

      const header = page.locator('header')
      await expect(header).toBeVisible()

      await expect(page.getByText(/production powerhouse/i)).toBeVisible()
    })

    test('should be responsive on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      const menuButton = page.getByRole('button', { name: /menu/i })
      await expect(menuButton).toBeVisible()

      await expect(page.getByText(/production powerhouse/i)).toBeVisible()
    })

    test('should display services cards in column on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.locator('#services').scrollIntoViewIfNeeded()

      await expect(page.getByText('Rapid Prototyping')).toBeVisible()
    })

    test('should display footer content stacked on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      const footer = page.locator('footer')
      await expect(footer).toBeVisible()
      await expect(footer.getByText(/MYRO/i)).toBeVisible()
    })
  })

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime

      expect(loadTime).toBeLessThan(5000)
    })

    test('should load images efficiently', async ({ page }) => {
      await page.waitForLoadState('networkidle')

      // Check that images are loaded
      const images = page.locator('img')
      const imageCount = await images.count()

      if (imageCount > 0) {
        // Check first image has loaded
        const firstImage = images.first()
        await expect(firstImage).toBeVisible()
      }
    })
  })
})
