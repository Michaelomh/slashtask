import { describe, expect, test } from 'vitest'
import { formatDueDate } from '@/lib/date'

describe('formatDueDate', () => {
  test('returns null for null or empty string', () => {
    expect(formatDueDate(null)).toBeNull()
    expect(formatDueDate('')).toBeNull()
  })

  test('returns a Date object for a valid date string', () => {
    expect(formatDueDate('2026-04-28')).toBeInstanceOf(Date)
  })

  test('returns null for a malformed string', () => {
    expect(formatDueDate('not-a-date')).toBeNull()
  })
})
