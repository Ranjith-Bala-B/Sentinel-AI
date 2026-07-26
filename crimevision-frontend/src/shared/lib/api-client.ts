/**
 * Central API client for calls to Sentinel AI FastAPI AppSail / Local Backend.
 *
 * Automatically detects localhost environment vs production cloud backend,
 * attaches Auth headers, and handles envelope unpacking for live database responses.
 */
import { catalystAuth } from "@/shared/lib/catalyst/client";

const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const DEFAULT_LOCAL_URL = "http://localhost:8000";
const DEFAULT_REMOTE_URL = "https://sentinel-ai-backend-50044342253.development.catalystappsail.in";

const RAW_URL = import.meta.env.VITE_API_BASE_URL;
// Force local backend http://localhost:8000 when running on localhost
const BASE_URL = (isLocalhost ? (RAW_URL && RAW_URL.includes("localhost") ? RAW_URL : DEFAULT_LOCAL_URL) : (RAW_URL && RAW_URL !== "/server" ? RAW_URL : DEFAULT_REMOTE_URL)).replace(/\/$/, "");

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
  try {
    const user = await catalystAuth.currentUser();
    const authHeader = user?.userId || "DSP-001";
    headers.set("Authorization", `Bearer ${authHeader}`);
  } catch {
    headers.set("Authorization", "Bearer DSP-001");
  }

  const endpoint = resolveEndpointPath(path);
  const targetUrl = `${BASE_URL}${endpoint}`;

  try {
    const res = await fetch(targetUrl, { ...init, headers });
    if (!res.ok) {
      let errText = `Request to ${path} failed with status ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson?.message) errText = errJson.message;
        else if (errJson?.detail) errText = typeof errJson.detail === "string" ? errJson.detail : JSON.stringify(errJson.detail);
      } catch {
        // use default status text
      }
      throw new ApiError(errText, res.status);
    }
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      throw new TypeError(`Response from ${path} is non-JSON HTML fallback`);
    }
    const json = (await res.json()) as Envelope<T>;
    if (json.error) throw new ApiError(json.error.message, res.status);
    return (json.data !== undefined ? json.data : json) as T;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[API ERROR] Request to ${targetUrl} failed: ${msg}`);
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
