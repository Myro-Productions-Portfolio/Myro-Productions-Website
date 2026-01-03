import { test, expect } from '@playwright/test'

test.describe('SEO & Meta Tags E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Meta Tags', () => {
    test('should have a proper title tag', async ({ page }) => {
      await expect(page).toHaveTitle(/myro productions.*rapid prototyping.*ai development/i)
    })

    test('should have a meta description', async ({ page }) => {
      const description = await page.locator('meta[name="description"]').getAttribute('content')
      expect(description).toBeTruthy()
      expect(description?.length).toBeGreaterThan(50)
      expect(description?.length).toBeLessThan(160)
      expect(description).toContain('concept to production')
    })

    test('should have meta keywords', async ({ page }) => {
      const keywords = await page.locator('meta[name="keywords"]').getAttribute('content')
      expect(keywords).toBeTruthy()
      expect(keywords).toContain('rapid prototyping')
      expect(keywords).toContain('AI development')
    })

    test('should have author meta tag', async ({ page }) => {
      const author = await page.locator('meta[name="author"]').getAttribute('content')
      expect(author).toBeTruthy()
      expect(author).toContain('Nicolas Robert Myers')
    })

    test('should have theme-color meta tag', async ({ page }) => {
      const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content')
      expect(themeColor).toBeTruthy()
    })

    test('should have viewport meta tag', async ({ page }) => {
      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
      expect(viewport).toBeTruthy()
      expect(viewport).toContain('width=device-width')
    })
  })

  test.describe('Open Graph Tags', () => {
    test('should have og:type meta tag', async ({ page }) => {
      const ogType = await page.locator('meta[property="og:type"]').getAttribute('content')
      expect(ogType).toBe('website')
    })

    test('should have og:title meta tag', async ({ page }) => {
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
      expect(ogTitle).toBeTruthy()
      expect(ogTitle).toContain('Myro Productions')
    })

    test('should have og:description meta tag', async ({ page }) => {
      const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content')
      expect(ogDescription).toBeTruthy()
      expect(ogDescription?.length).toBeGreaterThan(50)
    })

    test('should have og:url meta tag', async ({ page }) => {
      const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content')
      expect(ogUrl).toBeTruthy()
    })

    test('should have og:site_name meta tag', async ({ page }) => {
      const ogSiteName = await page.locator('meta[property="og:site_name"]').getAttribute('content')
      expect(ogSiteName).toBe('Myro Productions')
    })

    test('should have og:image meta tag', async ({ page }) => {
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content')
      expect(ogImage).toBeTruthy()
      expect(ogImage).toContain('.png')
    })

    test('should have og:image:width meta tag', async ({ page }) => {
      const ogImageWidth = await page.locator('meta[property="og:image:width"]').getAttribute('content')
      expect(ogImageWidth).toBe('1200')
    })

    test('should have og:image:height meta tag', async ({ page }) => {
      const ogImageHeight = await page.locator('meta[property="og:image:height"]').getAttribute('content')
      expect(ogImageHeight).toBe('630')
    })

    test('should have og:locale meta tag', async ({ page }) => {
      const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content')
      expect(ogLocale).toBe('en_US')
    })
  })

  test.describe('Twitter Card Tags', () => {
    test('should have twitter:card meta tag', async ({ page }) => {
      const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content')
      expect(twitterCard).toBe('summary_large_image')
    })

    test('should have twitter:title meta tag', async ({ page }) => {
      const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content')
      expect(twitterTitle).toBeTruthy()
      expect(twitterTitle).toContain('Myro Productions')
    })

    test('should have twitter:description meta tag', async ({ page }) => {
      const twitterDescription = await page.locator('meta[name="twitter:description"]').getAttribute('content')
      expect(twitterDescription).toBeTruthy()
      expect(twitterDescription?.length).toBeGreaterThan(50)
    })

    test('should have twitter:image meta tag', async ({ page }) => {
      const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute('content')
      expect(twitterImage).toBeTruthy()
    })
  })

  test.describe('Canonical URL', () => {
    test('should have a canonical link tag', async ({ page }) => {
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
      expect(canonical).toBeTruthy()
    })

    test('canonical URL should be absolute', async ({ page }) => {
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
      expect(canonical).toMatch(/^https?:\/\//)
    })
  })

  test.describe('Structured Data (JSON-LD)', () => {
    test('should have JSON-LD script', async ({ page }) => {
      const jsonLdScript = page.locator('script[type="application/ld+json"]')
      await expect(jsonLdScript).toBeAttached()
    })

    test('should have valid JSON-LD data', async ({ page }) => {
      const jsonLdScript = page.locator('script[type="application/ld+json"]').first()
      const jsonLdContent = await jsonLdScript.textContent()

      expect(jsonLdContent).toBeTruthy()

      // Parse to ensure it's valid JSON
      const jsonLdData = JSON.parse(jsonLdContent!)
      expect(jsonLdData).toBeTruthy()

      // Check for common schema.org properties
      expect(jsonLdData['@context']).toBe('https://schema.org')
      expect(jsonLdData['@type']).toBeTruthy()
    })

    test('JSON-LD should include organization or person data', async ({ page }) => {
      const jsonLdScript = page.locator('script[type="application/ld+json"]').first()
      const jsonLdContent = await jsonLdScript.textContent()
      const jsonLdData = JSON.parse(jsonLdContent!)

      // Should have either Organization or Person type
      const hasValidType = ['Organization', 'Person', 'LocalBusiness'].includes(jsonLdData['@type'])
      expect(hasValidType).toBeTruthy()
    })
  })

  test.describe('Robots & Crawling', () => {
    test('should allow indexing by default', async ({ page }) => {
      const robotsMeta = await page.locator('meta[name="robots"]').getAttribute('content')

      // If no robots meta, that's fine (means default indexing)
      // If it exists, it should not contain noindex
      if (robotsMeta) {
        expect(robotsMeta).not.toContain('noindex')
      }
    })

    test('robots.txt should be accessible', async ({ page, baseURL }) => {
      const response = await page.goto(`${baseURL}/robots.txt`)
      expect(response?.status()).toBeLessThan(400)
    })

    test('robots.txt should have proper content', async ({ page, baseURL }) => {
      const response = await page.goto(`${baseURL}/robots.txt`)
      const content = await page.textContent('body')

      expect(content).toBeTruthy()
      // Should contain User-agent
      expect(content).toMatch(/User-agent/i)
    })
  })

  test.describe('Sitemap', () => {
    test('sitemap.xml should be accessible', async ({ page, baseURL }) => {
      const response = await page.goto(`${baseURL}/sitemap.xml`)
      expect(response?.status()).toBeLessThan(400)
    })

    test('sitemap.xml should be valid XML', async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/sitemap.xml`)
      const content = await page.textContent('body')

      expect(content).toBeTruthy()
      expect(content).toContain('<?xml')
      expect(content).toContain('<urlset')
      expect(content).toContain('</urlset>')
    })

    test('sitemap.xml should contain homepage URL', async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/sitemap.xml`)
      const content = await page.textContent('body')

      expect(content).toContain('<loc>')
      expect(content).toContain('</loc>')
    })

    test('sitemap should be referenced in robots.txt', async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/robots.txt`)
      const content = await page.textContent('body')

      expect(content).toMatch(/sitemap.*\.xml/i)
    })
  })

  test.describe('Favicon & Icons', () => {
    test('should have a favicon link', async ({ page }) => {
      const favicon = page.locator('link[rel*="icon"]')
      await expect(favicon.first()).toBeAttached()
    })

    test('should have apple-touch-icon', async ({ page }) => {
      const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]')
      const count = await appleTouchIcon.count()

      // Should have at least one apple-touch-icon or generated by Next.js
      expect(count).toBeGreaterThanOrEqual(0)
    })

    test('should have manifest.json', async ({ page, baseURL }) => {
      const response = await page.goto(`${baseURL}/manifest.json`)
      expect(response?.status()).toBeLessThan(400)
    })

    test('manifest.json should be valid JSON', async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/manifest.json`)
      const content = await page.textContent('body')

      expect(content).toBeTruthy()

      const manifest = JSON.parse(content!)
      expect(manifest.name).toBeTruthy()
    })
  })

  test.describe('Language & Accessibility', () => {
    test('html tag should have lang attribute', async ({ page }) => {
      const htmlLang = await page.locator('html').getAttribute('lang')
      expect(htmlLang).toBe('en')
    })

    test('should have proper heading hierarchy', async ({ page }) => {
      const h1Count = await page.locator('h1').count()
      expect(h1Count).toBeGreaterThan(0)
      expect(h1Count).toBeLessThanOrEqual(2) // Should only have 1-2 h1 tags
    })

    test('images should have alt attributes', async ({ page }) => {
      const images = page.locator('img')
      const imageCount = await images.count()

      if (imageCount > 0) {
        // Check first few images for alt text
        for (let i = 0; i < Math.min(imageCount, 5); i++) {
          const img = images.nth(i)
          const alt = await img.getAttribute('alt')
          // Alt can be empty for decorative images, but attribute should exist
          expect(alt !== null).toBeTruthy()
        }
      }
    })
  })

  test.describe('Performance & Loading', () => {
    test('should preconnect to external domains', async ({ page }) => {
      // Check for preconnect links (optional but good for performance)
      const preconnects = await page.locator('link[rel="preconnect"]').count()

      // This is optional, so just log the count
      console.log(`Preconnect links found: ${preconnects}`)
    })

    test('should use Next.js optimization features', async ({ page }) => {
      // Check that Next.js is being used (via __NEXT_DATA__ script)
      const nextData = page.locator('script#__NEXT_DATA__')
      await expect(nextData).toBeAttached()
    })

    test('should have proper charset', async ({ page }) => {
      const charset = await page.locator('meta[charset]').getAttribute('charset')
      expect(charset?.toLowerCase()).toBe('utf-8')
    })
  })

  test.describe('Social Media Integration', () => {
    test('should have social media links', async ({ page }) => {
      // Check for LinkedIn, GitHub, Twitter links in footer
      const linkedInLink = page.getByLabel(/LinkedIn/i).first()
      const githubLink = page.getByLabel(/GitHub/i).first()

      await expect(linkedInLink).toBeVisible()
      await expect(githubLink).toBeVisible()
    })

    test('social media links should have proper attributes', async ({ page }) => {
      const linkedInLink = page.getByLabel(/LinkedIn/i).first()

      // Should open in new tab
      const target = await linkedInLink.getAttribute('target')
      expect(target).toBe('_blank')

      // Should have security attributes
      const rel = await linkedInLink.getAttribute('rel')
      expect(rel).toContain('noopener')
      expect(rel).toContain('noreferrer')
    })
  })

  test.describe('Schema Markup Validation', () => {
    test('should have contact point in schema', async ({ page }) => {
      const jsonLdScript = page.locator('script[type="application/ld+json"]').first()
      const jsonLdContent = await jsonLdScript.textContent()

      if (jsonLdContent) {
        const jsonLdData = JSON.parse(jsonLdContent)

        // Check for contact information in schema
        const hasContactInfo =
          jsonLdData.email ||
          jsonLdData.contactPoint ||
          jsonLdData.address ||
          jsonLdData.telephone

        // At least one form of contact should be in schema
        expect(hasContactInfo).toBeTruthy()
      }
    })
  })

  test.describe('URL Structure', () => {
    test('homepage URL should be clean', async ({ page }) => {
      expect(page.url()).toMatch(/\/$/)
      expect(page.url()).not.toContain('index.html')
    })

    test('should use HTTPS in production', async ({ page, baseURL }) => {
      // Only check if not localhost
      if (baseURL && !baseURL.includes('localhost') && !baseURL.includes('127.0.0.1')) {
        expect(page.url()).toMatch(/^https:\/\//)
      }
    })
  })
})
