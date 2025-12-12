// lib/ics.ts

// Shape of a parsed VEVENT
export type IcsEvent = {
  UID: string;
  SUMMARY?: string;
  DESCRIPTION?: string;
  DTSTART: string;
  DTEND: string;
  CATEGORIES?: string;
  DTSTAMP?: string;
  'LAST-MODIFIED'?: string;
  [key: string]: string | undefined;
  __raw: string; // original VEVENT block
};

/**
 * Parse a .ics text into VEVENT objects.
 * improved parser handles line unfolding and basic unescaping.
 */
export function parseIcsEvents(icsText: string): IcsEvent[] {
  const events: IcsEvent[] = [];

  // 1. Unfold lines (RFC 5545)
  // Lines starting with space/tab are continuations of the previous line.
  // We first normalize newlines, then iterate to unfold.
  const rawLines = icsText.replace(/\r\n/g, '\n').split('\n');
  const unfolded: string[] = [];

  for (const line of rawLines) {
    if (!line) continue;
    if (line.startsWith(' ') || line.startsWith('\t')) {
      if (unfolded.length > 0) {
        // Append to previous line, removing the first character (space/tab)
        unfolded[unfolded.length - 1] += line.slice(1);
      }
    } else {
      unfolded.push(line.trim()); // Trim purely to remove potential BOM or accidental whitespace at start of KEY
    }
  }

  // 2. Parse VEVENT blocks
  let currentEvent: Partial<IcsEvent> | null = null;
  let inEvent = false;

  for (const line of unfolded) {
    if (line === 'BEGIN:VEVENT') {
      currentEvent = { __raw: 'BEGIN:VEVENT\n' };
      inEvent = true;
      continue;
    }

    if (line === 'END:VEVENT') {
      if (inEvent && currentEvent) {
        currentEvent.__raw += 'END:VEVENT';
        // Check required fields
        if (currentEvent.UID && currentEvent.DTSTART) {
          events.push(currentEvent as IcsEvent);
        }
      }
      inEvent = false;
      currentEvent = null;
      continue;
    }

    if (inEvent && currentEvent) {
      currentEvent.__raw += line + '\n';

      // Parse "KEY;PARAM=VAL:VALUE" or "KEY:VALUE"
      const idx = line.indexOf(':');
      if (idx !== -1) {
        const keyPart = line.slice(0, idx);
        let value = line.slice(idx + 1);

        // Extract key name (ignore params for now)
        // e.g. DTSTART;TZID=Asia/Almaty -> DTSTART
        const key = keyPart.split(';')[0].toUpperCase();

        // Basic unescaping for text fields
        if (['SUMMARY', 'DESCRIPTION', 'CATEGORIES', 'LOCATION', 'CONTACT'].includes(key)) {
          value = value
            .replace(/\\n/g, '\n')
            .replace(/\\N/g, '\n')
            .replace(/\\,/g, ',')
            .replace(/\\;/g, ';')
            .replace(/\\\\/g, '\\');
        }

        currentEvent[key] = value;
      }
    }
  }

  return events;
}

/**
 * Convert ICS date-time like 20251211T060000Z to ISO string.
 * Now handles basic formatting better.
 */
export function parseIcsDate(value: string | undefined | null): string | null {
  if (!value) return null;

  // Pattern: YYYYMMDD T HHMMSS [Z]
  // Capture groups: 1=Y, 2=M, 3=D, 4=H, 5=m, 6=s, 7=Z(optional)
  const match = value.match(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/
  );

  if (match) {
    const [, y, m, d, hh, mm, ss, z] = match;
    // If Z is present, it's strictly UTC.
    // If Z is missing, it's floating/local. 
    // We append Z to enforce ISO format compatibility with Postgres timestamptz.
    // CAUTION: If the input is floating time, this effectively treats it as UTC.
    // This is often the desired behavior for simple syncs unless we parse TZID.
    return `${y}-${m}-${d}T${hh}:${mm}:${ss}Z`;
  }
  
  // Try to handle date-only: YYYYMMDD
  const dateMatch = value.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (dateMatch) {
     const [, y, m, d] = dateMatch;
     // All-day event? Return start of day UTC
     return `${y}-${m}-${d}T00:00:00Z`;
  }

  // Fallback for JS parsable strings
  const fallback = new Date(value);
  if (!isNaN(fallback.getTime())) {
    return fallback.toISOString();
  }

  return null;
}

/**
 * Detect event type from SUMMARY text.
 */
export function detectEventType(
  summary: string
): 'attendance' | 'deadline' | 'exam' | 'quiz' | 'homework' | 'other' {
  const s = summary.toLowerCase();

  if (s.includes('attendance')) return 'attendance';
  if (s.includes('quiz')) return 'quiz';
  if (s.includes('homework') || s.includes('assignment')) return 'homework';
  if (s.includes('final') || s.includes('midterm') || s.includes('endterm'))
    return 'exam';
  if (s.includes('due') || s.includes('closes')) return 'deadline';

  return 'other';
}

/**
 * Extract group name from SUMMARY like "Attendance (Group BDA-2506)".
 */
export function extractGroupName(summary: string): string | null {
  const match = summary.match(/Group\s+([A-Z0-9-]+)/i);
  return match ? match[1] : null;
}
