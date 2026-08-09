import "server-only";
import { env } from "@/lib/env";

/*
  Cloudflare Stream helpers. We never proxy video bytes through our own server
  (Render + Next server actions cap request bodies): instead we mint a one-time
  "direct creator upload" URL and the browser uploads straight to Cloudflare.
  The API token stays server-side; only the one-time upload URL reaches the client.
*/

const API = "https://api.cloudflare.com/client/v4";

/** True when the account id + API token are both present in the environment. */
export const isStreamConfigured = Boolean(env.CLOUDFLARE_ACCOUNT_ID && env.CLOUDFLARE_STREAM_TOKEN);

function authHeaders() {
  return { Authorization: `Bearer ${env.CLOUDFLARE_STREAM_TOKEN}` };
}

export type DirectUpload = { uploadURL: string; uid: string };

/** Ask Cloudflare for a one-time upload URL. The browser POSTs the file to it. */
export async function createDirectUpload(opts: { maxDurationSeconds?: number; name?: string } = {}): Promise<DirectUpload> {
  if (!isStreamConfigured) throw new Error("Cloudflare Stream is not configured");
  const res = await fetch(`${API}/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      maxDurationSeconds: opts.maxDurationSeconds ?? 3600,
      requireSignedURLs: false,
      ...(opts.name ? { meta: { name: opts.name } } : {}),
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.success) {
    throw new Error(json?.errors?.[0]?.message ?? "Could not start the upload");
  }
  return { uploadURL: json.result.uploadURL as string, uid: json.result.uid as string };
}

export type StreamStatus = {
  readyToStream: boolean;
  durationSec: number | null;
  thumbnail: string | null;
  state: string;
};

/** Read a video's transcode status (used to flip a clip from Processing to Ready). */
export async function getStreamStatus(uid: string): Promise<StreamStatus | null> {
  if (!isStreamConfigured) return null;
  const res = await fetch(`${API}/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/stream/${uid}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.success) return null;
  const r = json.result;
  return {
    readyToStream: Boolean(r?.readyToStream),
    durationSec: typeof r?.duration === "number" && r.duration > 0 ? Math.round(r.duration) : null,
    thumbnail: r?.thumbnail ?? null,
    state: r?.status?.state ?? "unknown",
  };
}

/** Best-effort delete of the source video on Cloudflare when a clip is removed. */
export async function deleteStreamVideo(uid: string): Promise<void> {
  if (!isStreamConfigured) return;
  await fetch(`${API}/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/stream/${uid}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).catch(() => {});
}

/** Iframe embed URL for playback. Uses the account's customer subdomain when set. */
export function streamIframeSrc(uid: string): string {
  const sub = env.NEXT_PUBLIC_STREAM_CUSTOMER_SUBDOMAIN;
  return sub ? `https://${sub}/${uid}/iframe` : `https://iframe.videodelivery.net/${uid}`;
}
