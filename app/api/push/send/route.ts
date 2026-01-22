import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

type PushPayload = {
  title?: string;
  body?: string;
  url?: string;
};

export async function POST(request: Request) {
  const payload: PushPayload = await request.json().catch(() => ({}));

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

  if (!publicKey || !privateKey) {
    return NextResponse.json(
      { error: "Missing VAPID keys" },
      { status: 500 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: rows, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, subscription")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const results = await Promise.allSettled(
    (rows || []).map(async (row) => {
      try {
        await webpush.sendNotification(
          row.subscription,
          JSON.stringify({
            title: payload.title || "Qoldanba",
            body: payload.body || "New update",
            url: payload.url || "/my",
          })
        );
      } catch (err: any) {
        const statusCode = err?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", row.id);
        }
        throw err;
      }
    })
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  return NextResponse.json({ ok: true, failed });
}
