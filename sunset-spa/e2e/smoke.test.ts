import { test, expect } from '@playwright/test'

/**
 * Browser smoke test — Sunset SPA.
 *
 * Verifies that the production build serves the SPA shell from a single route
 * and makes no backend API requests during initial render.
 *
 * Prerequisites: `npm run build` must be run before `npm run test:e2e`
 * (playwright.config.ts starts vite preview automatically via webServer).
 */

test.describe('Sunset SPA smoke test', () => {
  test('serves the root route and renders the shell', async ({ page }) => {
    await page.goto('/')

    // Title is set in the document
    await expect(page).toHaveTitle(/Sunset/)

    // Branded heading is visible
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toContainText('Sunset')

    // Main landmark is present
    await expect(page.getByRole('main')).toBeVisible()

    // Initial loading region is visible
    await expect(page.getByRole('status')).toBeVisible()
  })

  test('does not make any backend API requests during initial render', async ({ page }) => {
    const apiRequests: string[] = []

    // Intercept all network requests and collect anything that looks like an API call
    page.on('request', (request) => {
      const url = request.url()
      const resourceType = request.resourceType()
      // Static assets (document, script, stylesheet, image, font) are expected
      const staticTypes = new Set(['document', 'script', 'stylesheet', 'image', 'font', 'other'])
      if (!staticTypes.has(resourceType)) {
        apiRequests.push(url)
      }
      // Also flag any path containing /api/ regardless of resource type
      if (url.includes('/api/')) {
        apiRequests.push(url)
      }
    })

    await page.goto('/')

    // Wait for the initial render to stabilise
    await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible' })

    expect(apiRequests, 'No backend API requests should be made on load').toHaveLength(0)
  })

  test('renders the shell at an arbitrary client-side path', async ({ page }) => {
    // Vite preview serves the SPA index for all routes (single-page fallback)
    await page.goto('/verification/some-result-id')

    // The root shell should still render
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toContainText('Sunset')
  })

  test('shell content is visible without styles (text fallback)', async ({ page }) => {
    // Block all CSS to simulate a styles load failure
    await page.route('**/*.css', (route) => route.abort())

    await page.goto('/')

    // Core text content must still be readable as plain HTML
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Sunset')
    await expect(page.getByRole('status')).toContainText('Loading verification results')
  })
})
