import { describe, it, expect } from 'vitest'
import {
  FIXTURE_INVENTORY,
  EXPECTED_FIXTURE_COUNT,
} from './fixtureInventory'

/**
 * Fixture inventory tests.
 *
 * These tests act as a guard against accidental changes to the evidence set:
 *   - Exactly four fixtures must always be present (no more, no less).
 *   - Each fixture must have a stable, non-empty identifier.
 *   - Each fixture must resolve to a non-null JSON object.
 *   - The expected IDs must all be present (renames fail fast).
 *
 * A fifth fixture being added, a file being renamed, or a fixture being
 * replaced with null/undefined will all cause these tests to fail.
 */
describe('fixtureInventory', () => {
  it('contains exactly four fixtures', () => {
    expect(FIXTURE_INVENTORY).toHaveLength(EXPECTED_FIXTURE_COUNT)
  })

  it('each entry has a non-empty string id', () => {
    for (const entry of FIXTURE_INVENTORY) {
      expect(typeof entry.id).toBe('string')
      expect(entry.id.length).toBeGreaterThan(0)
    }
  })

  it('each entry has a non-empty title', () => {
    for (const entry of FIXTURE_INVENTORY) {
      expect(typeof entry.title).toBe('string')
      expect(entry.title.length).toBeGreaterThan(0)
    }
  })

  it('each entry has a non-empty subtitle', () => {
    for (const entry of FIXTURE_INVENTORY) {
      expect(typeof entry.subtitle).toBe('string')
      expect(entry.subtitle.length).toBeGreaterThan(0)
    }
  })

  it('each entry has a non-empty narrative', () => {
    for (const entry of FIXTURE_INVENTORY) {
      expect(typeof entry.narrative).toBe('string')
      expect(entry.narrative.length).toBeGreaterThan(0)
    }
  })

  it('each entry has a non-null JSON object as raw content', () => {
    for (const entry of FIXTURE_INVENTORY) {
      expect(entry.raw).not.toBeNull()
      expect(typeof entry.raw).toBe('object')
    }
  })

  it('IDs are the expected stable set in order', () => {
    const ids = FIXTURE_INVENTORY.map((e) => e.id)
    expect(ids).toEqual(['01', '02', '03', '04'])
  })

  it('fixture 01 is the invoice reconciliation scenario (green_light verdict)', () => {
    const raw = FIXTURE_INVENTORY[0]?.raw as Record<string, unknown>
    expect(raw['verdict']).toBe('green_light')
    expect(raw['fixture_name']).toBe('a_invoice_recon')
  })

  it('fixture 02 is the inventory export scenario (green_light, 1 attempt)', () => {
    const raw = FIXTURE_INVENTORY[1]?.raw as Record<string, unknown>
    expect(raw['verdict']).toBe('green_light')
    expect(raw['fixture_name']).toBe('b_data_export')
    const attempts = raw['attempts'] as unknown[]
    expect(attempts).toHaveLength(1)
  })

  it('fixture 03 is the escalated scenario', () => {
    const raw = FIXTURE_INVENTORY[2]?.raw as Record<string, unknown>
    expect(raw['verdict']).toBe('escalated')
    expect(raw['fixture_name']).toBe('c_never_converges')
  })

  it('fixture 04 is the unverifiable scenario', () => {
    const raw = FIXTURE_INVENTORY[3]?.raw as Record<string, unknown>
    expect(raw['verdict']).toBe('unverifiable')
    expect(raw['determinism_check_passed']).toBe(false)
  })

  it('ids are unique', () => {
    const ids = FIXTURE_INVENTORY.map((e) => e.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(FIXTURE_INVENTORY.length)
  })

  it('no fixture has a null or undefined raw value (guard against stub data)', () => {
    const nullish = FIXTURE_INVENTORY.filter(
      (e) => e.raw === null || e.raw === undefined,
    )
    expect(nullish).toHaveLength(0)
  })
})
