/**
 * Central API client for calls to Catalyst API Gateway / Serverless Functions.
 *
 * Automatically resolves relative /server/ function endpoints on Slate client hosting,
 * attaches Auth headers, and gracefully falls back to mock data if the network / backend
 * is temporarily unreachable.
 */
import { catalystAuth } from "@/shared/lib/catalyst/client";
import { getDevMock } from "@/shared/lib/dev-mocks";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/server").replace(/\/$/, "");

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
  status?: string;
}

/**
 * Maps standard API routes to their corresponding Catalyst Advanced I/O function endpoints:
 *  - /dashboard/summary -> /dashboard-service/
 *  - /auth/*            -> /auth-service/*
 *  - /crimes/*          -> /crime-service/*
 *  - /assistant/*       -> /assistant-service/*
 *  - /insights/*        -> /insights-service/*
 */
function resolveEndpointPath(path: string): string {
  if (path.startsWith("/dashboard")) {
    return path.replace(/^\/dashboard(\/summary)?/, "/dashboard-service/");
  }
  if (path.startsWith("/auth")) {
    return path.replace(/^\/auth/, "/auth-service");
  }
  if (path.startsWith("/crimes")) {
    return path.replace(/^\/crimes/, "/crime-service");
  }
  if (path.startsWith("/assistant")) {
    return path.replace(/^\/assistant/, "/assistant-service");
  }
  if (path.startsWith("/insights")) {
    return path.replace(/^\/insights/, "/insights-service");
  }
  return path;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const user = await catalystAuth.currentUser();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (user) headers.set("Authorization", `Bearer ${user.userId}`);

  const endpoint = resolveEndpointPath(path);
  const targetUrl = `${BASE_URL}${endpoint}`;

  try {
    const res = await fetch(targetUrl, { ...init, headers });
    if (!res.ok) {
      throw new ApiError(`Request to ${path} failed with status ${res.status}`, res.status);
    }
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      throw new TypeError(`Response from ${path} is non-JSON HTML fallback`);
    }
    const json = (await res.json()) as Envelope<T>;
    if (json.error) throw new ApiError(json.error.message, res.status);
    return (json.data !== undefined ? json.data : json) as T;
  } catch (err) {
    // Fail-safe fallback: serve mock data if live endpoint is unreachable
    const mock = await getDevMock<T>(path, init);
    if (mock !== undefined) return mock;
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
