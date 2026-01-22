import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

type ScheduleSession = {
  time: string;
  discipline?: string;
  classroom?: string;
};

type WeekSchedule = Record<string, ScheduleSession[]>;

const TIMEZONE = process.env.APP_TIMEZONE || "Asia/Almaty";
const LEAD_MINUTES = Number(process.env.PUSH_CLASS_LEAD_MINUTES || "15");
const WINDOW_MINUTES = Number(process.env.PUSH_CLASS_WINDOW_MINUTES || "5");

const getZonedParts = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const lookup = (type: string) =>
    parts.find((part) => part.type === type)?.value || "";

  return {
    year: lookup("year"),
    month: lookup("month"),
    day: lookup("day"),
    weekday: lookup("weekday"),
    hour: Number(lookup("hour")),
    minute: Number(lookup("minute")),
  };
};

const getDateKey = (parts: ReturnType<typeof getZonedParts>) => {
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const parseStartMinutes = (time: string) => {
  const [start] = time.split("-");
  if (!start) return null;
  const [h, m] = start.split(":").map((v) => Number(v));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const makeClassKey = (
  groupName: string,
  weekday: string,
  session: ScheduleSession
) => {
  const discipline = session.discipline || "";
  const classroom = session.classroom || "";
  return `${groupName}|${weekday}|${session.time}|${discipline}|${classroom}`;
};

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization") || "";
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!publicKey || !privateKey || !supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Missing VAPID or Supabase service credentials" },
      { status: 500 }
    );
  }

  const service = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const now = new Date();
  const todayParts = getZonedParts(now, TIMEZONE);
  const tomorrowParts = getZonedParts(
    new Date(now.getTime() + 24 * 60 * 60 * 1000),
    TIMEZONE
  );

  const nowMinutes = todayParts.hour * 60 + todayParts.minute;
  const targetStart = nowMinutes + LEAD_MINUTES;
  const targetEnd = targetStart + WINDOW_MINUTES;

  const windows: Array<{ weekday: string; dateKey: string; start: number; end: number }> = [];
  if (targetEnd <= 1440) {
    windows.push({
      weekday: todayParts.weekday,
      dateKey: getDateKey(todayParts),
      start: targetStart,
      end: targetEnd,
    });
  } else {
    windows.push({
      weekday: todayParts.weekday,
      dateKey: getDateKey(todayParts),
      start: targetStart,
      end: 1440,
    });
    windows.push({
      weekday: tomorrowParts.weekday,
      dateKey: getDateKey(tomorrowParts),
      start: 0,
      end: targetEnd - 1440,
    });
  }

  const { data: schedules, error: scheduleError } = await service
    .from("schedules")
    .select("group_name, week_schedule");

  if (scheduleError) {
    return NextResponse.json(
      { error: scheduleError.message },
      { status: 500 }
    );
  }

  const matches: Array<{
    groupName: string;
    session: ScheduleSession;
    weekday: string;
    dateKey: string;
  }> = [];

  for (const row of schedules || []) {
    const groupName = String(row.group_name || "").toUpperCase();
    const weekSchedule = row.week_schedule as WeekSchedule | null;
    if (!groupName || !weekSchedule) continue;

    for (const window of windows) {
      const sessions = weekSchedule[window.weekday] || [];
      for (const session of sessions) {
        const startMinutes = parseStartMinutes(session.time);
        if (startMinutes === null) continue;
        if (startMinutes >= window.start && startMinutes < window.end) {
          matches.push({
            groupName,
            session,
            weekday: window.weekday,
            dateKey: window.dateKey,
          });
        }
      }
    }
  }

  if (matches.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const groups = Array.from(new Set(matches.map((m) => m.groupName)));
  const { data: subs, error: subsError } = await service
    .from("push_subscriptions")
    .select("id, subscription, group_name")
    .in("group_name", groups);

  if (subsError) {
    return NextResponse.json({ error: subsError.message }, { status: 500 });
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  let sent = 0;

  for (const match of matches) {
    const groupSubs = (subs || []).filter(
      (sub) =>
        String(sub.group_name || "").toUpperCase() === match.groupName
    );

    for (const sub of groupSubs) {
      const classKey = makeClassKey(match.groupName, match.weekday, match.session);
      const { error: insertError } = await service
        .from("push_class_sends")
        .insert({
          subscription_id: sub.id,
          class_key: classKey,
          class_date: match.dateKey,
        });

      if (insertError) {
        if (insertError.code === "23505") {
          continue;
        }
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      const title = "Class starting soon";
      const bodyParts = [];
      if (match.session.discipline) bodyParts.push(match.session.discipline);
      if (match.session.time) bodyParts.push(match.session.time);
      if (match.session.classroom) bodyParts.push(match.session.classroom);

      await webpush.sendNotification(
        sub.subscription,
        JSON.stringify({
          title,
          body: bodyParts.join(" · "),
          url: "/my",
        })
      );
      sent += 1;
    }
  }

  return NextResponse.json({ ok: true, sent });
}
