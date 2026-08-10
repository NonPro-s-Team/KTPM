import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FunnelsPage } from '../src/pages/FunnelsPage'

describe('FunnelsPage', () => {
  it('renders the page title and subtitle', () => {
    render(<FunnelsPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Funnels' })).toBeInTheDocument()
    expect(
      screen.getByText('Analyze user journeys and optimize conversion funnels.'),
    ).toBeInTheDocument()
  })

  it('renders all five KPI cards with their values', () => {
    render(<FunnelsPage />)

    expect(screen.getByText('Total Completions')).toBeInTheDocument()
    expect(screen.getByText('8,540')).toBeInTheDocument()
    expect(screen.getByText('68,412')).toBeInTheDocument()
    expect(screen.getByText('2d 14h')).toBeInTheDocument()
    expect(screen.getByText('67.52%')).toBeInTheDocument()
    // "Overall Conversion Rate" is used both as a KPI label and as the main
    // funnel card's summary label, so it legitimately appears twice.
    expect(screen.getAllByText('Overall Conversion Rate')).toHaveLength(2)
  })

  it('renders the main funnel steps in order', () => {
    render(<FunnelsPage />)

    expect(screen.getByText('Signup to Paid Conversion Funnel')).toBeInTheDocument()
    expect(screen.getByText('1. Sign Up')).toBeInTheDocument()
    expect(screen.getByText('5. Subscribed')).toBeInTheDocument()
    expect(screen.getByText('63,212')).toBeInTheDocument()
  })

  it('renders the funnel performance table rows', () => {
    render(<FunnelsPage />)

    expect(screen.getByText('Funnel Performance')).toBeInTheDocument()
    expect(screen.getByText('Opportunity to Win')).toBeInTheDocument()
    expect(screen.getByText('28.91%')).toBeInTheDocument()
  })

  it('renders the top drop-off reasons and sample size', () => {
    render(<FunnelsPage />)

    expect(screen.getByText('Too early in buying journey')).toBeInTheDocument()
    expect(screen.getByText('Based on 2,543 responses')).toBeInTheDocument()
  })

  it('has an accessible search input and main navigation landmark', () => {
    render(<FunnelsPage />)

    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
  })
})
