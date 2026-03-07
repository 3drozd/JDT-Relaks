const WINDOW_MS = 60_000; // 1 minute

const requests = new Map<string, number[]>();

export function rateLimit(
  ip: string,
  maxRequests: number
): { success: boolean } {
  const now = Date.now();
  const timestamps =
    requests.get(ip)?.filter((t) => now - t < WINDOW_MS) ?? [];

  if (timestamps.length >= maxRequests) {
    return { success: false };
  }

  timestamps.push(now);
  requests.set(ip, timestamps);
  return { success: true };
}
