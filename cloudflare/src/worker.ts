import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

type ScheduleSession = {
  time: string;
  discipline?: string;
  classroom?: string;
};

type WeekSchedule = Record<string, ScheduleSession[]>;

type DeadlineRow = {
  id: string;
  user_id: string;
  title: string | null;
  end_at: string | null;
};

type Env = {
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
  VAPID_SUBJECT?: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  CRON_SECRET?: string;
  APP_TIMEZONE?: string;
  PUSH_CLASS_LEAD_MINUTES?: string;
  PUSH_CLASS_WINDOW_MINUTES?: string;
  PUSH_DEADLINE_LEAD_MINUTES?: string;
  PUSH_DEADLINE_WINDOW_MINUTES?: string;
};

type ScheduledEvent = {
  cron: string;
  scheduledTime: number;
};

type ExecutionContext = {
  waitUntil(promise: Promise<unknown>): void;
};

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

const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60 * 1000);

const sendClassReminders = async (env: Env) => {
  const timezone = env.APP_TIMEZONE || "Asia/Almaty";
  const leadMinutes = Number(env.PUSH_CLASS_LEAD_MINUTES || "15");
  const windowMinutes = Number(env.PUSH_CLASS_WINDOW_MINUTES || "5");

  const service = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const now = new Date();
  const todayParts = getZonedParts(now, timezone);
  const tomorrowParts = getZonedParts(
    new Date(now.getTime() + 24 * 60 * 60 * 1000),
    timezone
  );

  const nowMinutes = todayParts.hour * 60 + todayParts.minute;
  const targetStart = nowMinutes + leadMinutes;
  const targetEnd = targetStart + windowMinutes;

  const windows: Array<{
    weekday: string;
    dateKey: string;
    start: number;
    end: number;
  }> = [];

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

  if (scheduleError || !schedules) {
    throw new Error(scheduleError?.message || "Failed to fetch schedules");
  }

  const matches: Array<{
    groupName: string;
    session: ScheduleSession;
    weekday: string;
    dateKey: string;
  }> = [];

  for (const row of schedules) {
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
    return 0;
  }

  const groups = Array.from(new Set(matches.map((m) => m.groupName)));
  const { data: subs, error: subsError } = await service
    .from("push_subscriptions")
    .select("id, subscription, group_name")
    .in("group_name", groups);

  if (subsError || !subs) {
    throw new Error(subsError?.message || "Failed to fetch subscriptions");
  }

  let sent = 0;

  for (const match of matches) {
    const groupSubs = subs.filter(
      (sub) => String(sub.group_name || "").toUpperCase() === match.groupName
    );

    for (const sub of groupSubs) {
      const classKey = makeClassKey(
        match.groupName,
        match.weekday,
        match.session
      );
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
        throw new Error(insertError.message);
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

  return sent;
};

const sendDeadlineReminders = async (env: Env) => {
  const windowMinutes = Number(env.PUSH_DEADLINE_WINDOW_MINUTES || "5");
  const leadMinutes = (env.PUSH_DEADLINE_LEAD_MINUTES || "60,1440")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => !Number.isNaN(value) && value > 0);

  if (leadMinutes.length === 0) return 0;

  const service = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const now = new Date();
  let sent = 0;

  for (const lead of leadMinutes) {
    const start = addMinutes(now, lead);
    const end = addMinutes(start, windowMinutes);

    const { data: deadlines, error } = await service
      .from("deadlines")
      .select("id, user_id, title, end_at")
      .gte("end_at", start.toISOString())
      .lt("end_at", end.toISOString());

    if (error) {
      throw new Error(error.message);
    }

    if (!deadlines || deadlines.length === 0) {
      continue;
    }

    const userIds = Array.from(new Set(deadlines.map((d) => d.user_id)));
    const { data: subs, error: subsError } = await service
      .from("push_subscriptions")
      .select("id, user_id, subscription")
      .in("user_id", userIds);

    if (subsError || !subs) {
      throw new Error(subsError?.message || "Failed to fetch subscriptions");
    }

    const subsByUser = new Map<string, typeof subs>();
    for (const sub of subs) {
      const list = subsByUser.get(sub.user_id) || [];
      list.push(sub);
      subsByUser.set(sub.user_id, list);
    }

    for (const deadline of deadlines as DeadlineRow[]) {
      if (!deadline.end_at) continue;
      const userSubs = subsByUser.get(deadline.user_id) || [];
      for (const sub of userSubs) {
        const { error: insertError } = await service
          .from("push_deadline_sends")
          .insert({
            subscription_id: sub.id,
            deadline_id: deadline.id,
            lead_minutes: lead,
          });

        if (insertError) {
          if (insertError.code === "23505") {
            continue;
          }
          throw new Error(insertError.message);
        }

        await webpush.sendNotification(
          sub.subscription,
          JSON.stringify({
            title: "Deadline reminder",
            body: deadline.title
              ? `${deadline.title} in ${lead >= 1440 ? "1 day" : "1 hour"}`
              : `Deadline in ${lead >= 1440 ? "1 day" : "1 hour"}`,
            url: "/my",
          })
        );
        sent += 1;
      }
    }
  }

  return sent;
};

const runReminders = async (env: Env) => {
  const publicKey = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = env.VAPID_PRIVATE_KEY;
  const subject = env.VAPID_SUBJECT || "mailto:admin@example.com";

  if (!publicKey || !privateKey || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing VAPID or Supabase service credentials");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const classCount = await sendClassReminders(env);
  const deadlineCount = await sendDeadlineReminders(env);
  return { classCount, deadlineCount };
};

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runReminders(env));
  },
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const secret = env.CRON_SECRET;
    if (secret) {
      const authHeader = request.headers.get("authorization") || "";
      if (authHeader !== `Bearer ${secret}`) {
        return new Response("Unauthorized", { status: 401 });
      }
    }

    try {
      const result = await runReminders(env);
      return new Response(JSON.stringify({ ok: true, ...result }), {
        headers: { "content-type": "application/json" },
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({ ok: false, error: err?.message || "Error" }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }
  },
};
