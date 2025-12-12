'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { parseIcsEvents, detectEventType, parseIcsDate } from '@/lib/ics';

export async function syncDeadlines(icsUrl: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  try {
    const res = await fetch(icsUrl);
    if (!res.ok) throw new Error('Failed to fetch ICS');
    const icsText = await res.text();
    const events = parseIcsEvents(icsText);

    if (events.length === 0) return { count: 0 };

    const rows = events
    .filter((ev) => !!!ev.SUMMARY?.toLocaleLowerCase().includes('attendance')) // Skip events with 'Attendance' in the title
    
    .map((ev) => {
      const categories = ev.CATEGORIES ?? '';
      const [subject, lecturer] = categories.split('|').map((s) => s.trim());
      const title = ev.SUMMARY ?? 'Untitled';
      const eventType = detectEventType(title);
      console.log(ev.SUMMARY);
      
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
        ics_last_modified: ev['LAST-MODIFIED'] ? parseIcsDate(ev['LAST-MODIFIED']) : null,
        ics_dtstamp: ev.DTSTAMP ? parseIcsDate(ev.DTSTAMP) : null,
        raw_vevent: ev.__raw,
      };
    });

    const { error } = await supabase
      .from('deadlines')
      .upsert(rows, { onConflict: 'user_id, ics_uid' });

    if (error) throw error;

    // revalidatePath('/my');
    return { count: rows.length };
  } catch (error: any) {
    console.error('Sync error:', error);
    return { error: error.message };
  }
}


export async function getDeadlines() {
  const supabase = await createClient();

  const { data: deadlines, error } = await supabase
    .from('deadlines')
    .select('*')
    .order('end_at', { ascending: true });

  if (error) {
    console.error('Error fetching deadlines:', error);
    return [];
  }

  return deadlines;
}

export async function updateDeadline(id: string, updates: any) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('deadlines')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating deadline:', error);
    throw new Error('Failed to update deadline');
  }

  revalidatePath('/my');
  return { success: true };
}
