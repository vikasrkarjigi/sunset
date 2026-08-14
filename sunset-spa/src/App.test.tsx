import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

/**
 * App shell unit tests.
 *
 * These tests verify that the Sunset SPA shell renders the correct branding,
 * demo framing copy, accessible landmarks, and loading region without any
 * network calls or backend dependencies.
 */
describe('App shell', () => {
  it('renders the Sunset branded title', () => {
    render(<App />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Sunset')
  })

  it('renders the product tagline', () => {
    render(<App />)
    expect(
      screen.getByText(/Legacy Modernization Verifier/i),
    ).toBeInTheDocument()
  })

  it('renders the demo framing copy', () => {
    render(<App />)
    expect(
      screen.getByText(/Modernize legacy scripts with proof of behavioral equivalence/i),
    ).toBeInTheDocument()
  })

  it('renders the initial loading region', () => {
    render(<App />)
    const statusRegion = screen.getByRole('status')
    expect(statusRegion).toBeInTheDocument()
    expect(statusRegion).toHaveTextContent(/Loading verification results/i)
  })

  it('marks the loading region as a live region', () => {
    render(<App />)
    const statusRegion = screen.getByRole('status')
    expect(statusRegion).toHaveAttribute('aria-live', 'polite')
  })

  it('renders an accessible main landmark', () => {
    render(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders an accessible banner landmark', () => {
    render(<App />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders an accessible contentinfo landmark', () => {
    render(<App />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('does not render any form elements (static shell only)', () => {
    render(<App />)
    expect(screen.queryAllByRole('textbox')).toHaveLength(0)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })
})
