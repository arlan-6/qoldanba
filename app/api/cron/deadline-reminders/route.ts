import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

type DeadlineRow = {
  id: string;
  user_id: string;
  title: string | null;
  end_at: string | null;
};

const WINDOW_MINUTES = Number(process.env.PUSH_DEADLINE_WINDOW_MINUTES || "5");
const LEAD_MINUTES = (
  process.env.PUSH_DEADLINE_LEAD_MINUTES || "60,1440"
)
  .split(",")
  .map((value) => Number(value.trim()))
  .filter((value) => !Number.isNaN(value) && value > 0);

const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60 * 1000);

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

  if (LEAD_MINUTES.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const service = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const now = new Date();
  let sent = 0;

  for (const lead of LEAD_MINUTES) {
    const start = addMinutes(now, lead);
    const end = addMinutes(start, WINDOW_MINUTES);

    const { data: deadlines, error } = await service
      .from("deadlines")
      .select("id, user_id, title, end_at")
      .gte("end_at", start.toISOString())
      .lt("end_at", end.toISOString());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!deadlines || deadlines.length === 0) {
      continue;
    }

    const userIds = Array.from(new Set(deadlines.map((d) => d.user_id)));
    const { data: subs, error: subsError } = await service
      .from("push_subscriptions")
      .select("id, user_id, subscription")
      .in("user_id", userIds);

    if (subsError) {
      return NextResponse.json({ error: subsError.message }, { status: 500 });
    }

    const subsByUser = new Map<string, typeof subs>();
    for (const sub of subs || []) {
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
          return NextResponse.json(
            { error: insertError.message },
            { status: 500 }
          );
        }

        try {
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
        } catch (err: any) {
          const statusCode = err?.statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await service
              .from("push_subscriptions")
              .delete()
              .eq("id", sub.id);
          }
        }
      }
    }
  }

  return NextResponse.json({ ok: true, sent });
}
