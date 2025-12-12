import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
// import type { Database } from '@/lib/database.types'; // your Supabase types (optional)
import { parseIcsEvents, detectEventType, parseIcsDate } from '@/lib/ics';

export async function POST(req: Request) {
  const supabase = await createClient();

  // 1) Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2) Read body
  const body = await req.json().catch(() => null) as { icsUrl?: string } | null;
  const icsUrl = body?.icsUrl;

  if (!icsUrl) {
    return NextResponse.json({ error: 'icsUrl is required' }, { status: 400 });
  }

  try {
    const parsed = new URL(icsUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  // 3) Fetch ICS file
  const res = await fetch(icsUrl);
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch ICS file' }, { status: 400 });
  }
  const icsText = await res.text();

  // 4) Parse VEVENTs
  const events = parseIcsEvents(icsText);

  if (events.length === 0) {
    return NextResponse.json({ message: 'No VEVENTs found in ICS' });
  }
  console.log(events);
  
  // 5) Map to deadlines rows
  const rows = events
    .filter((ev) => !!!ev.SUMMARY?.toLocaleLowerCase().includes('attendance')) // Skip events with 'Attendance' in the title
    .map((ev) => {
      const categories = ev.CATEGORIES ?? '';
      const [subject, lecturer] = categories.split('|').map((s) => s.trim());
      console.log(ev.SUMMARY);
      
      const title = ev.SUMMARY ?? 'Untitled';
      const eventType = detectEventType(title);

      return {
        user_id: user.id,
        ics_uid: ev.UID,
        source: 'lms',

        title,
        description: ev.DESCRIPTION || null,
        event_type: eventType,

        subject: subject || null,
        lecturer: lecturer || null,

        start_at: parseIcsDate(ev.DTSTART),
        end_at: parseIcsDate(ev.DTEND),

        ics_last_modified: ev['LAST-MODIFIED']
          ? parseIcsDate(ev['LAST-MODIFIED'])
          : null,
        ics_dtstamp: ev.DTSTAMP ? parseIcsDate(ev.DTSTAMP) : null,

        raw_vevent: ev.__raw,
      };
    });

  // 6) Upsert into deadlines
  const { error } = await supabase
    .from('deadlines')
    .upsert(rows, {
      onConflict: 'user_id, ics_uid',
    });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: 'Synced deadlines from ICS',
    count: rows.length,
  });
}
