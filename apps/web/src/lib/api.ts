import { logApiOutRequest, logApiOutResponse, logException, withTags } from "@demo/sdk";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export type ApiError = {
  status: number;
  bodyText: string;
};

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { requestName?: string },
): Promise<T> {
  const requestName = init?.requestName ?? `${init?.method ?? "GET"} ${path}`;
  const method = (init?.method ?? "GET").toUpperCase();

  withTags({ "request.name": requestName, "request.path": path }, () => {
    logApiOutRequest({ method, path, requestName });
  });

  try {
    const res = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!res.ok) {
      const bodyText = await res.text();
      const apiError: ApiError = { status: res.status, bodyText };

      withTags({ "request.name": requestName, "request.path": path, "http.status": res.status }, () => {
        logApiOutResponse({ method, path, status: res.status, requestName, context: { bodyText } });
      });

      throw apiError;
    }

    const json = (await res.json()) as T;

    withTags({ "request.name": requestName, "request.path": path, "http.status": res.status }, () => {
      logApiOutResponse({ method, path, status: res.status, requestName });
    });

    return json;
  } catch (err) {
    logException(err, { requestName, path });
    throw err;
  }
}
