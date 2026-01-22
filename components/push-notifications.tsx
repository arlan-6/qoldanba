"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export function PushNotifications() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [status, setStatus] = useState<string>("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const isSupported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    setSupported(isSupported);
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }
  }, []);

  const canSubscribe = useMemo(() => {
    return supported && !!VAPID_PUBLIC_KEY;
  }, [supported]);

  const subscribe = async () => {
    setStatus("");
    if (!canSubscribe) {
      setStatus("Push not supported or missing VAPID key.");
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        setStatus("Permission denied.");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Subscription failed");
      }

      setSubscribed(true);
      setStatus("Subscribed.");
    } catch (err) {
      console.error(err);
      setStatus("Failed to subscribe.");
    }
  };

  const sendTest = async () => {
    setStatus("");
    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Qoldanba | Test",
          body: "Test notification",
          url: "/my",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Send failed");
      }
      setStatus("Sent.");
    } catch (err) {
      console.error(err);
      setStatus("Failed to send.");
    }
  };

  if (!supported) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" onClick={subscribe} disabled={permission === "denied"}>
        {subscribed ? "Notifications enabled" : "Enable notifications"}
      </Button>
      <Button type="button" variant="outline" onClick={sendTest}>
        Send test
      </Button>
      {status ? <span className="text-sm text-muted-foreground">{status}</span> : null}
    </div>
  );
}
