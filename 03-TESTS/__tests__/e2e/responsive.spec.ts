import { test, expect, Page } from '@playwright/test';

/**
 * Responsive Design E2E Tests
 *
 * Tests the website across multiple viewport sizes to ensure:
 * - No horizontal scrolling
 * - Proper content stacking
 * - Navigation state changes
 * - Touch target sizes (44x44px minimum)
 * - Text readability
 */

const VIEWPORTS = {
  mobile320: { width: 320, height: 568 },
  mobile375: { width: 375, height: 667 },
  mobile414: { width: 414, height: 896 },
  tablet: { width: 768, height: 1024 },
  desktop1024: { width: 1024, height: 768 },
  desktop1280: { width: 1280, height: 800 },
  desktop1440: { width: 1440, height: 900 },
};

type ViewportName = keyof typeof VIEWPORTS;

// Helper to check for horizontal scroll
async function checkNoHorizontalScroll(page: Page) {
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.body.scrollWidth > window.innerWidth;
  });
  expect(hasHorizontalScroll).toBe(false);
}

// Helper to check touch target size
async function checkTouchTargetSize(page: Page, selector: string, minSize = 44) {
  const element = page.locator(selector).first();
  const box = await element.boundingBox();

  if (box) {
    expect(box.width).toBeGreaterThanOrEqual(minSize);
    expect(box.height).toBeGreaterThanOrEqual(minSize);
  }
}

// Helper to check element visibility
async function isElementVisible(page: Page, selector: string): Promise<boolean> {
  try {
    await page.locator(selector).first().waitFor({ state: 'visible', timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

test.describe('Responsive Design Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  // Test each viewport size
  Object.entries(VIEWPORTS).forEach(([name, viewport]) => {
    test.describe(`${name} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize(viewport);
      });

      test('should have no horizontal scroll', async ({ page }) => {
        // Check all sections for horizontal scroll
        const sections = ['#home', '#services', '#portfolio', '#about', '#contact'];

        for (const section of sections) {
          await page.locator(section).scrollIntoViewIfNeeded();
          await page.waitForTimeout(300); // Let animations settle
          await checkNoHorizontalScroll(page);
        }
      });

      test('should display navigation correctly', async ({ page }) => {
        const isMobile = viewport.width < 768;

        if (isMobile) {
          // Mobile: hamburger menu should be visible
          const hamburger = page.locator('button[aria-label*="menu"]');
          await expect(hamburger).toBeVisible();

          // Desktop nav should be hidden
          const desktopNav = page.locator('nav .hidden.md\\:flex');
          await expect(desktopNav).not.toBeVisible();

          // Click hamburger to open menu
          await hamburger.click();
          await page.waitForTimeout(300); // Wait for animation

          // Mobile menu should be visible
          const mobileMenu = page.locator('#mobile-menu');
          await expect(mobileMenu).toBeVisible();

          // Check touch target size for mobile menu items
          await checkTouchTargetSize(page, '#mobile-menu a', 44);

        } else {
          // Desktop: nav links should be visible
          const desktopNav = page.locator('nav .hidden.md\\:flex');
          await expect(desktopNav).toBeVisible();

          // Hamburger should be hidden
          const hamburger = page.locator('button[aria-label*="menu"]');
          await expect(hamburger).not.toBeVisible();
        }
      });

      test('should stack hero buttons correctly', async ({ page }) => {
        await page.locator('#home').scrollIntoViewIfNeeded();

        const buttons = page.locator('#home button');
        const firstButton = buttons.first();
        const secondButton = buttons.nth(1);

        const firstBox = await firstButton.boundingBox();
        const secondBox = await secondButton.boundingBox();

        if (firstBox && secondBox) {
          if (viewport.width < 640) {
            // Mobile: buttons should stack (second button below first)
            expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 10);
          } else {
            // Desktop: buttons should be side-by-side (roughly same y position)
            expect(Math.abs(secondBox.y - firstBox.y)).toBeLessThan(10);
          }
        }
      });

      test('should display services in correct grid layout', async ({ page }) => {
        await page.locator('#services').scrollIntoViewIfNeeded();
        await page.waitForTimeout(500); // Wait for scroll animations

        const cards = page.locator('#services [class*="grid"] > div');
        const count = await cards.count();

        expect(count).toBe(3); // Should always have 3 service cards

        // Check grid layout
        const firstCard = cards.first();
        const secondCard = cards.nth(1);
        const firstBox = await firstCard.boundingBox();
        const secondBox = await secondCard.boundingBox();

        if (firstBox && secondBox) {
          if (viewport.width < 768) {
            // Mobile: cards stack vertically (1 column)
            expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 20);
          } else if (viewport.width < 1024) {
            // Tablet: 2 columns, second card might wrap
            const sameRow = Math.abs(secondBox.y - firstBox.y) < 20;
            const nextRow = secondBox.y > firstBox.y + firstBox.height - 20;
            expect(sameRow || nextRow).toBe(true);
          } else {
            // Desktop: 3 columns, all in same row
            expect(Math.abs(secondBox.y - firstBox.y)).toBeLessThan(20);
          }
        }
      });

      test('should display portfolio in correct grid layout', async ({ page }) => {
        await page.locator('#portfolio').scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        const cards = page.locator('#portfolio [class*="grid"] > div');
        const count = await cards.count();

        expect(count).toBeGreaterThan(0); // Should have portfolio items

        if (count >= 2) {
          const firstCard = cards.first();
          const secondCard = cards.nth(1);
          const firstBox = await firstCard.boundingBox();
          const secondBox = await secondCard.boundingBox();

          if (firstBox && secondBox) {
            if (viewport.width < 768) {
              // Mobile: 1 column, cards stack
              expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 20);
            } else if (viewport.width < 1024) {
              // Tablet: 2 columns
              const sameRow = Math.abs(secondBox.y - firstBox.y) < 20;
              expect(sameRow).toBe(true);
            } else {
              // Desktop: 3 columns
              expect(Math.abs(secondBox.y - firstBox.y)).toBeLessThan(20);
            }
          }
        }
      });

      test('should display about section correctly', async ({ page }) => {
        await page.locator('#about').scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        const avatar = page.locator('#about [class*="w-80"]').first();
        const content = page.locator('#about [class*="space-y-6"]').first();

        const avatarBox = await avatar.boundingBox();
        const contentBox = await content.boundingBox();

        if (avatarBox && contentBox) {
          if (viewport.width < 1024) {
            // Mobile/Tablet: content stacks below avatar
            expect(contentBox.y).toBeGreaterThan(avatarBox.y);
          } else {
            // Desktop: side-by-side (roughly same y position)
            expect(Math.abs(contentBox.y - avatarBox.y)).toBeLessThan(100);
          }
        }
      });

      test('should display contact form correctly', async ({ page }) => {
        await page.locator('#contact').scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        const form = page.locator('#contact form');
        await expect(form).toBeVisible();

        // Check form inputs are accessible
        const nameInput = page.locator('input[name="name"]');
        const emailInput = page.locator('input[name="email"]');
        const submitButton = page.locator('button[type="submit"]');

        await expect(nameInput).toBeVisible();
        await expect(emailInput).toBeVisible();
        await expect(submitButton).toBeVisible();

        // Check submit button touch target size on mobile
        if (viewport.width < 640) {
          await checkTouchTargetSize(page, 'button[type="submit"]', 44);
        }
      });

      test('should display footer correctly', async ({ page }) => {
        await page.locator('footer').scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);

        const footer = page.locator('footer');
        await expect(footer).toBeVisible();

        // Footer should always be visible and not cause horizontal scroll
        await checkNoHorizontalScroll(page);

        // Check social links are accessible
        const socialLinks = page.locator('footer a[target="_blank"]');
        const count = await socialLinks.count();
        expect(count).toBeGreaterThan(0);
      });

      test('should have readable text sizes', async ({ page }) => {
        // Main headline should be readable
        const headline = page.locator('#home h1');
        const fontSize = await headline.evaluate((el) => {
          return parseInt(window.getComputedStyle(el).fontSize);
        });

        // Minimum font size should be reasonable for viewport
        if (viewport.width >= 1024) {
          expect(fontSize).toBeGreaterThanOrEqual(48); // Desktop: large headline
        } else if (viewport.width >= 640) {
          expect(fontSize).toBeGreaterThanOrEqual(36); // Tablet: medium headline
        } else {
          expect(fontSize).toBeGreaterThanOrEqual(32); // Mobile: smaller but readable
        }
      });

      test('should handle scroll indicator correctly', async ({ page }) => {
        const scrollIndicator = page.locator('#home .animate-bounce');
        const isVisible = await isElementVisible(page, '#home .animate-bounce');

        // Scroll indicator should be visible on all sizes (it's positioned absolutely)
        expect(isVisible).toBe(true);
      });
    });
  });

  test.describe('Specific responsive issues', () => {
    test('should handle very small mobile (320px)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile320);

      // Navigation should work
      const hamburger = page.locator('button[aria-label*="menu"]');
      await expect(hamburger).toBeVisible();

      // Logo should be visible and not wrap
      const logo = page.locator('a[aria-label*="Home"]');
      await expect(logo).toBeVisible();

      // No horizontal scroll
      await checkNoHorizontalScroll(page);
    });

    test('should handle tablet landscape (768px)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.tablet);

      // Should show hamburger menu at this size
      const hamburger = page.locator('button[aria-label*="menu"]');
      await expect(hamburger).toBeVisible();

      // Services should be 2-column
      await page.locator('#services').scrollIntoViewIfNeeded();
      const cards = page.locator('#services [class*="grid"] > div');
      expect(await cards.count()).toBe(3);
    });

    test('should handle large desktop (1440px)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop1440);

      // Content should be centered with max-width
      const container = page.locator('#home .max-w-6xl');
      const box = await container.boundingBox();

      if (box) {
        // Should have margins on both sides
        expect(box.x).toBeGreaterThan(0);
        expect(box.x + box.width).toBeLessThan(1440);
      }
    });
  });

  test.describe('Touch interactions on mobile', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile375);
    });

    test('should have proper touch targets for mobile menu', async ({ page }) => {
      const hamburger = page.locator('button[aria-label*="menu"]');
      await checkTouchTargetSize(page, 'button[aria-label*="menu"]', 44);

      // Open menu
      await hamburger.click();
      await page.waitForTimeout(300);

      // All menu items should have proper touch targets
      const menuItems = page.locator('#mobile-menu a');
      const count = await menuItems.count();

      for (let i = 0; i < count; i++) {
        const item = menuItems.nth(i);
        const box = await item.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('should have proper touch targets for buttons', async ({ page }) => {
      // Hero CTA buttons
      const ctaButtons = page.locator('#home button');
      const count = await ctaButtons.count();

      for (let i = 0; i < count; i++) {
        const button = ctaButtons.nth(i);
        const box = await button.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44);
          expect(box.width).toBeGreaterThanOrEqual(100); // Reasonable width
        }
      }
    });
  });

  test.describe('Content overflow checks', () => {
    test('should not have text overflow on small screens', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile320);

      // Check various text elements don't overflow
      const sections = ['#home', '#services', '#about', '#contact'];

      for (const section of sections) {
        await page.locator(section).scrollIntoViewIfNeeded();
        await checkNoHorizontalScroll(page);
      }
    });

    test('should handle long service descriptions', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile375);
      await page.locator('#services').scrollIntoViewIfNeeded();

      // Service cards should contain their content
      await checkNoHorizontalScroll(page);

      const cards = page.locator('#services [class*="grid"] > div');
      const firstCard = cards.first();
      const cardBox = await firstCard.boundingBox();

      if (cardBox) {
        // Card should fit in viewport width (with padding)
        expect(cardBox.width).toBeLessThanOrEqual(375);
      }
    });
  });
});
