import { headers } from "next/headers";

async function getInternalApiBaseUrl() {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  if (!host) return null;

  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

export async function triggerProcessDecisionLogs() {
  const secret = process.env.CRON_SECRET;
  if (!secret) return;

  const baseUrl = await getInternalApiBaseUrl();
  if (!baseUrl) return;

  await fetch(`${baseUrl}/api/internal/process-decision-logs`, {
    method: "GET",
    headers: { Authorization: `Bearer ${secret}` },
  }).catch(() => {
    // Cron will retry queued items if this background trigger fails.
  });
}
