import webpush from "npm:web-push@3.6.7";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.0";

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

type ScheduleRow = {
  group_name: string | null;
  week_schedule: WeekSchedule | null;
};

type SubscriptionRow = {
  id: string;
  subscription: PushSubscription;
  group_name?: string | null;
  user_id?: string | null;
};

type EnvConfig = {
  vapidPublicKey: string;
  vapidPrivateKey: string;
  vapidSubject: string;
  supabaseUrl: string;
  serviceRoleKey: string;
  cronSecret: string;
  timezone: string;
  classLeadMinutes: number;
  classWindowMinutes: number;
  deadlineLeadMinutes: number[];
  deadlineWindowMinutes: number;
};

const getEnv = (key: string) => Deno.env.get(key) || "";

const getRequiredEnv = (key: string) => {
  const value = getEnv(key);
  if (!value) throw new Error(`Missing ${key}`);
  return value;
};

const loadConfig = (): EnvConfig => ({
  vapidPublicKey: getRequiredEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY"),
  vapidPrivateKey: getRequiredEnv("VAPID_PRIVATE_KEY"),
  vapidSubject: getEnv("VAPID_SUBJECT") || "mailto:admin@example.com",
  supabaseUrl: getRequiredEnv("SUPABASE_URL"),
  serviceRoleKey: getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  cronSecret: getEnv("CRON_SECRET"),
  timezone: getEnv("APP_TIMEZONE") || "Asia/Almaty",
  classLeadMinutes: Number(getEnv("PUSH_CLASS_LEAD_MINUTES") || "15"),
  classWindowMinutes: Number(getEnv("PUSH_CLASS_WINDOW_MINUTES") || "5"),
  deadlineLeadMinutes: (getEnv("PUSH_DEADLINE_LEAD_MINUTES") || "60,1440")
    .split(",")
    .map((value: string) => Number(value.trim()))
    .filter((value: number) => !Number.isNaN(value) && value > 0),
  deadlineWindowMinutes: Number(getEnv("PUSH_DEADLINE_WINDOW_MINUTES") || "5"),
});

const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60 * 1000);

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

const getDateKey = (parts: ReturnType<typeof getZonedParts>) =>
  `${parts.year}-${parts.month}-${parts.day}`;

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

const formatLeadLabel = (minutes: number) => {
  if (minutes >= 1440) return "1 day";
  if (minutes >= 60) return "1 hour";
  return `${minutes} min`;
};

const getSupabaseService = (config: EnvConfig) =>
  createClient(config.supabaseUrl, config.serviceRoleKey, {
    auth: { persistSession: false },
  });

const sendNotification = async (
  service: ReturnType<typeof getSupabaseService>,
  subscriptionId: string,
  subscription: PushSubscription,
  payload: Record<string, string>
) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (err: unknown) {
    const statusCode =
      typeof err === "object" && err !== null && "statusCode" in err
        ? (err as { statusCode?: number }).statusCode
        : undefined;
    if (statusCode === 404 || statusCode === 410) {
      await service.from("push_subscriptions").delete().eq("id", subscriptionId);
    }
    return false;
  }
};

const sendClassReminders = async (config: EnvConfig) => {
  const service = getSupabaseService(config);
  const now = new Date();
  const todayParts = getZonedParts(now, config.timezone);
  const tomorrowParts = getZonedParts(
    new Date(now.getTime() + 24 * 60 * 60 * 1000),
    config.timezone
  );

  const nowMinutes = todayParts.hour * 60 + todayParts.minute;
  const targetStart = nowMinutes + config.classLeadMinutes;
  const targetEnd = targetStart + config.classWindowMinutes;

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
    .from<ScheduleRow>("schedules")
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
    const weekSchedule = row.week_schedule;
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
    .from<SubscriptionRow>("push_subscriptions")
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

      const bodyParts = [];
      if (match.session.discipline) bodyParts.push(match.session.discipline);
      if (match.session.time) bodyParts.push(match.session.time);
      if (match.session.classroom) bodyParts.push(match.session.classroom);

      const ok = await sendNotification(
        service,
        sub.id,
        sub.subscription,
        {
          title: "Class starting soon",
          body: bodyParts.join(" · "),
          url: "/my",
        }
      );
      if (ok) sent += 1;
    }
  }

  return sent;
};

const sendDeadlineReminders = async (config: EnvConfig) => {
  if (config.deadlineLeadMinutes.length === 0) return 0;

  const service = getSupabaseService(config);
  const now = new Date();
  let sent = 0;

  for (const lead of config.deadlineLeadMinutes) {
    const start = addMinutes(now, lead);
    const end = addMinutes(start, config.deadlineWindowMinutes);

    const { data: deadlines, error } = await service
      .from<DeadlineRow>("deadlines")
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
      .from<SubscriptionRow>("push_subscriptions")
      .select("id, user_id, subscription")
      .in("user_id", userIds);

    if (subsError || !subs) {
      throw new Error(subsError?.message || "Failed to fetch subscriptions");
    }

    const subsByUser = new Map<string, SubscriptionRow[]>();
    for (const sub of subs) {
      const list = subsByUser.get(sub.user_id || "") || [];
      list.push(sub);
      if (sub.user_id) subsByUser.set(sub.user_id, list);
    }

    for (const deadline of deadlines) {
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

        const label = formatLeadLabel(lead);
        const ok = await sendNotification(
          service,
          sub.id,
          sub.subscription,
          {
            title: "Deadline reminder",
            body: deadline.title
              ? `${deadline.title} in ${label}`
              : `Deadline in ${label}`,
            url: "/my",
          }
        );
        if (ok) sent += 1;
      }
    }
  }

  return sent;
};

Deno.serve(async (request) => {
  let config: EnvConfig;
  try {
    config = loadConfig();
  } catch (err: unknown) {
    return new Response(err instanceof Error ? err.message : "Missing configuration", {
      status: 500,
    });
  }

  if (config.cronSecret) {
    const authHeader = request.headers.get("authorization") || "";
    if (authHeader !== `Bearer ${config.cronSecret}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  webpush.setVapidDetails(
    config.vapidSubject,
    config.vapidPublicKey,
    config.vapidPrivateKey
  );

  try {
    const classCount = await sendClassReminders(config);
    const deadlineCount = await sendDeadlineReminders(config);
    return new Response(
      JSON.stringify({ ok: true, classCount, deadlineCount }),
      { headers: { "content-type": "application/json" } }
    );
  } catch (err: unknown) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: err instanceof Error ? err.message : "Error",
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
});
