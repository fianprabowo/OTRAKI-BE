export type LogContext = Record<string, unknown>;

type LogLevel = "debug" | "info" | "warning" | "error" | "fatal";

type HttpSentryConfig = {
  storeUrl: string;
  key: string;
  client?: string;
  version?: string;
  logger?: string;
  platform?: string;
};

type Tags = Record<string, string | number | boolean | null | undefined>;

let globalTags: Tags = {};

function normalizeTags(tags: Tags): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(tags)) {
    if (v === undefined || v === null) continue;
    out[k] = String(v);
  }
  return out;
}

function getHttpConfig(): HttpSentryConfig | null {
  const storeUrl =
    process.env.NEXT_PUBLIC_SENTRY_STORE_URL ??
    process.env.SENTRY_STORE_URL ??
    "";
  const key =
    process.env.NEXT_PUBLIC_SENTRY_KEY ??
    process.env.SENTRY_KEY ??
    "";

  if (!storeUrl || !key) return null;

  return {
    storeUrl,
    key,
    client: process.env.NEXT_PUBLIC_SENTRY_CLIENT ?? process.env.SENTRY_CLIENT ?? "otraki-sdk/1.0",
    version: process.env.NEXT_PUBLIC_SENTRY_VERSION ?? process.env.SENTRY_VERSION ?? "7",
    logger: process.env.NEXT_PUBLIC_SENTRY_LOGGER ?? process.env.SENTRY_LOGGER ?? "otraki-manual-test",
    platform: process.env.NEXT_PUBLIC_SENTRY_PLATFORM ?? process.env.SENTRY_PLATFORM ?? "other",
  };
}

async function sendToSentry(payload: unknown) {
  const cfg = getHttpConfig();
  if (!cfg) return;

  const auth = `Sentry sentry_version=${cfg.version ?? "7"}, sentry_key=${cfg.key}, sentry_client=${cfg.client ?? "otraki-sdk/1.0"}`;

  try {
    await fetch(cfg.storeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sentry-Auth": auth,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return;
  }
}

export function setTags(tags: Tags) {
  globalTags = { ...globalTags, ...tags };
}

export function clearTags() {
  globalTags = {};
}

export function logEvent(name: string, context: LogContext) {
  void sendMessage({ message: name, level: "info", tags: { event: name }, extra: context });
}

export function logException(error: unknown, context: LogContext) {
  const message = error instanceof Error ? error.message : "unknown_error";
  void sendMessage({
    message,
    level: "error",
    tags: { event: "exception" },
    extra: {
      ...context,
      errorName: error instanceof Error ? error.name : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    },
  });
}

export function withTags<T>(tags: Tags, fn: () => T): T;
export function withTags<T>(tags: Tags, fn: () => Promise<T>): Promise<T>;
export function withTags<T>(tags: Tags, fn: () => T | Promise<T>): T | Promise<T> {
  const prev = globalTags;
  globalTags = { ...globalTags, ...tags };
  let isAsync = false;
  try {
    const result = fn();
    if (result && typeof (result as unknown as { then?: unknown }).then === "function") {
      isAsync = true;
      return (async () => {
        try {
          return await (result as Promise<T>);
        } finally {
          globalTags = prev;
        }
      })();
    }
    return result;
  } finally {
    if (!isAsync) globalTags = prev;
  }
}

export function logApiOutRequest(input: { method: string; path: string; requestName?: string; context?: LogContext }) {
  const suffix = input.requestName ? ` ${input.requestName}` : "";
  const message = `[API_OUT Request] ${input.method.toUpperCase()} ${input.path}${suffix}`;
  void sendMessage({
    message,
    level: "info",
    tags: { direction: "api_out", stage: "request" },
    extra: input.context ?? {},
  });
}

export function logApiOutResponse(input: { method: string; path: string; status: number; requestName?: string; context?: LogContext }) {
  const suffix = input.requestName ? ` ${input.requestName}` : "";
  const message = `[API_OUT Response] ${input.method.toUpperCase()} ${input.path} status=${input.status}${suffix}`;
  void sendMessage({
    message,
    level: input.status >= 400 ? "error" : "info",
    tags: { direction: "api_out", stage: "response", "http.status": input.status },
    extra: input.context ?? {},
  });
}

export function logApiInRequest(input: { method: string; endpoint: string; context?: LogContext }) {
  const message = `[API_IN Request] ${input.method.toUpperCase()} ${input.endpoint}`;
  void sendMessage({
    message,
    level: "info",
    tags: { direction: "api_in", stage: "request" },
    extra: input.context ?? {},
  });
}

export function logApiInResponse(input: { method: string; endpoint: string; status: number; context?: LogContext }) {
  const message = `[API_IN Response] ${input.method.toUpperCase()} ${input.endpoint} status=${input.status}`;
  void sendMessage({
    message,
    level: input.status >= 400 ? "error" : "info",
    tags: { direction: "api_in", stage: "response", "http.status": input.status },
    extra: input.context ?? {},
  });
}

function sendMessage(input: { message: string; level: LogLevel; tags?: Tags; extra?: LogContext }) {
  const cfg = getHttpConfig();
  void sendToSentry({
    message: input.message,
    level: input.level,
    platform: cfg?.platform ?? "other",
    logger: cfg?.logger ?? "otraki-manual-test",
    tags: normalizeTags({ ...globalTags, ...(input.tags ?? {}) }),
    extra: input.extra ?? {},
  });
}
