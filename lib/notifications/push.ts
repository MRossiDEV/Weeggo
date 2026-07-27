import "server-only";
import webpush from "web-push";

import type { PushSubscriptionInput } from "./types";

let configured = false;

/** Lazily configures VAPID once — missing keys degrade to a no-op (logged), same convention as lib/email/send-email.ts. */
function ensureConfigured(): boolean {
  if (configured) return true;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return false;

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
}

export type PushResult = { ok: true } | { ok: false; gone: boolean };

/** Sends one Web Push message. `gone: true` means the subscription is dead (410/404) and should be deleted. */
export async function sendPush(subscription: PushSubscriptionInput, payload: PushPayload): Promise<PushResult> {
  if (!ensureConfigured()) {
    console.warn(`[push] VAPID not configured — skipped push "${payload.title}".`);
    return { ok: false, gone: false };
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload)
    );
    return { ok: true };
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    const gone = statusCode === 404 || statusCode === 410;
    if (!gone) console.error("[push] send failed", err);
    return { ok: false, gone };
  }
}
