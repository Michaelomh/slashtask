import { describe, expect, test, vi, afterEach } from 'vitest';
import { isTaskOverdue, truncateDescriptionText } from '@/lib/task';
import { taskFactory } from '../factories/task.factory';
import { format, addDays, subDays } from 'date-fns';

const today = format(new Date(), 'yyyy-MM-dd');
const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

describe('isTaskOverdue', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('returns false when due_date is null', () => {
    const task = taskFactory.build({ due_date: null });
    expect(isTaskOverdue(task, false)).toBe(false);
  });

  test('returns false when task is completed regardless of due date', () => {
    const task = taskFactory.build({ due_date: yesterday });
    expect(isTaskOverdue(task, true)).toBe(false);
  });

  test('returns false when due date is today', () => {
    const task = taskFactory.build({ due_date: today });
    expect(isTaskOverdue(task, false)).toBe(false);
  });

  test('returns false when due date is in the future', () => {
    const task = taskFactory.build({ due_date: tomorrow });
    expect(isTaskOverdue(task, false)).toBe(false);
  });

  test('returns true when due date is in the past and task is not completed', () => {
    const task = taskFactory.build({ due_date: yesterday });
    expect(isTaskOverdue(task, false)).toBe(true);
  });

  test('returns false at 11:59 PM on the due date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-28T23:59:59'));
    const task = taskFactory.build({ due_date: '2026-04-28' });
    expect(isTaskOverdue(task, false)).toBe(false);
  });

  test('returns true one second after midnight on the day after the due date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-29T00:00:01'));
    const task = taskFactory.build({ due_date: '2026-04-28' });
    expect(isTaskOverdue(task, false)).toBe(true);
  });
});

describe('truncateDescriptionText', () => {
  test('returns text unchanged when under 500 chars', () => {
    const text = 'short text';
    expect(truncateDescriptionText(text)).toBe('short text');
  });

  test('truncates to exactly 500 chars when text exceeds 500 chars', () => {
    const text = 'a'.repeat(600);
    expect(truncateDescriptionText(text)).toHaveLength(500);
  });

  test('returns empty string for empty input', () => {
    expect(truncateDescriptionText('')).toBe('');
    expect(truncateDescriptionText()).toBe('');
  });
});
