/**
 * Central API client for calls to Sentinel AI FastAPI AppSail Backend.
 *
 * Connects directly to AppSail FastAPI backend, attaches Auth headers,
 * and handles envelope unpacking for live database responses.
 */
import { catalystAuth } from "@/shared/lib/catalyst/client";
import { getDevMock } from "@/shared/lib/dev-mocks";

const DEFAULT_BACKEND_URL = "https://sentinel-ai-backend-50044342253.development.catalystappsail.in";

const RAW_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = (RAW_URL && RAW_URL !== "/server" ? RAW_URL : DEFAULT_BACKEND_URL).replace(/\/$/, "");

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

function resolveEndpointPath(path: string): string {
  return path;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  // Include user token or default DSP officer token for live FastAPI DB endpoints
  const user = await catalystAuth.currentUser();
  const authHeader = user?.userId || "DSP-001";
  headers.set("Authorization", `Bearer ${authHeader}`);

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
    console.warn(`[API WARN] Failed to fetch live data from ${targetUrl}:`, err);
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
