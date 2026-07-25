/**
 * Central API client for calls to Catalyst API Gateway
 * (/server/crimevision-backend/api/v1/...).
 *
 * Every request attaches the Catalyst Auth bearer token and
 * unwraps the standard { data, meta, error } envelope returned
 * by every backend function (see common/schemas.py on the backend).
 *
 * Local-dev fallback: when no Catalyst backend is deployed yet, `fetch`
 * fails with a network error rather than a normal HTTP error. In that
 * case (dev mode only) we serve a small set of local mocks so the UI
 * stays fully demoable before `catalyst deploy` - this fallback never
 * runs in production, where a real network failure should surface.
 */
import { catalystAuth } from "@/shared/lib/catalyst/client";
import { getDevMock } from "@/shared/lib/dev-mocks";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/server/crimevision-backend/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface Envelope<T> {
  data: T;
  meta?: Record<string, unknown>;
  error?: { message: string } | null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const user = await catalystAuth.currentUser();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (user) headers.set("Authorization", `Bearer ${user.userId}`);

  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
    if (!res.ok) {
      throw new ApiError(`Request to ${path} failed with ${res.status}`, res.status);
    }
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      throw new TypeError(`Response from ${path} is non-JSON HTML fallback`);
    }
    const json = (await res.json()) as Envelope<T>;
    if (json.error) throw new ApiError(json.error.message, res.status);
    return json.data;
  } catch (err) {
    if (import.meta.env.DEV) {
      const mock = await getDevMock<T>(path, init);
      if (mock !== undefined) return mock;
    }
    throw err;
  }
}


export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
