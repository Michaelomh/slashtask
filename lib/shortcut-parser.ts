import * as chrono from 'chrono-node';

// ── Custom chrono instance with ordinal-only date support ─────────────────────

const customChrono = chrono.casual.clone();

// Adds support for bare ordinals: "15th", "1st", "31st", "the 15th"
// Resolves to: if day >= today's day this month → this month, else next month
customChrono.parsers.push({
  pattern: () => /\b(?:the\s+)?(\d{1,2})(st|nd|rd|th)\b/i,
  extract: (context, match) => {
    const day = parseInt(match[1]);
    if (day < 1 || day > 31) return null;

    const ref = new Date(context.refDate);
    ref.setHours(0, 0, 0, 0);

    let target = new Date(ref.getFullYear(), ref.getMonth(), day);
    if (target < ref) {
      target = new Date(ref.getFullYear(), ref.getMonth() + 1, day);
    }

    return {
      day: target.getDate(),
      month: target.getMonth() + 1,
      year: target.getFullYear(),
    };
  },
});

export interface DateToken {
  date: Date;
  text: string;
  start: number;
  end: number;
}

/**
 * Parses natural language date phrases from the input string.
 * Returns the LAST detected date token (ignores time-only phrases like "3pm").
 * Returns null if no date phrase found.
 */
export function parseDateToken(input: string, refDate: Date): DateToken | null {
  const results = customChrono.parse(input, refDate);

  // Filter to results with an explicit day component (avoids "3pm" → today false positives)
  const dateResults = results.filter((r) => r.start.isCertain('day'));
  if (dateResults.length === 0) return null;

  // Use the last match
  const last = dateResults[dateResults.length - 1];
  return {
    date: last.start.date(),
    text: last.text,
    start: last.index,
    end: last.index + last.text.length,
  };
}

// ── Trigger-character shortcuts ───────────────────────────────────────────────

/**
 * Generic trigger finder. Scans text before the cursor for an active
 * trigger character (`#`, `!`, `@`) with no space between it and cursor.
 *
 * Examples (triggerChar = '#'):
 *   "Fix bug #wo|"        → { query: 'wo', start: 8 }
 *   "Fix bug #work done|" → null  (space after token deactivates trigger)
 *   "Fix bug|"            → null
 */
export function findTrigger(
  input: string,
  cursorPos: number,
  triggerChar: string
): { query: string; start: number } | null {
  const textBeforeCursor = input.slice(0, cursorPos);
  const idx = textBeforeCursor.lastIndexOf(triggerChar);
  if (idx === -1) return null;

  const afterTrigger = textBeforeCursor.slice(idx + 1);
  // A space after the trigger char means the token is complete — no longer active
  if (afterTrigger.includes(' ')) return null;

  return { query: afterTrigger, start: idx };
}

/** Convenience wrapper for the project `#` trigger. */
export function findProjectTrigger(
  input: string,
  cursorPos: number
): { query: string; start: number } | null {
  return findTrigger(input, cursorPos, '#');
}

/**
 * Removes a trigger token (e.g. `#work`) from the input string and
 * collapses any double-spaces left behind.
 *
 * ("Fix bug #work more", 8, 13) → "Fix bug more"
 */
export function removeTriggerToken(
  input: string,
  start: number,
  end: number
): string {
  const before = input.slice(0, start);
  const after = input.slice(end);
  // Collapse the join point: if both sides have a space, keep one
  const joined = before + after;
  return joined.replace(/  +/g, ' ').trimStart();
}
