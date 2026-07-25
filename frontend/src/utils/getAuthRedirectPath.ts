export function getAuthRedirectPath(state: unknown, fallback = "/app") {
  if (!state || typeof state !== "object" || !("from" in state)) {
    return fallback;
  }

  const from = (state as { from?: { pathname?: unknown } }).from;

  return typeof from?.pathname === "string" ? from.pathname : fallback;
}
