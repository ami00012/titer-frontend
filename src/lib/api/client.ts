import { createClient } from "@/lib/supabase/client";
import { getDeviceId } from "@/lib/device-id";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`API request failed with status ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

async function buildHeaders(init: RequestInit): Promise<Record<string, string>> {
  // FormData bodies (file uploads) must NOT get an explicit Content-Type --
  // the browser sets its own multipart boundary. JSON requests still default to it.
  const isFormData = init.body instanceof FormData;
  const workspaceId = useWorkspaceStore.getState().currentWorkspaceId;
  return {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    "X-Device-Id": getDeviceId(),
    ...(workspaceId ? { "X-Workspace-Id": workspaceId } : {}),
    ...(await authHeader()),
    ...(init.headers as Record<string, string> | undefined),
  };
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = await buildHeaders(init);
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Same auth/device/workspace headers as apiFetch, but for binary responses (file downloads) that can't be parsed as JSON. */
export async function apiFetchBlob(path: string, init: RequestInit = {}): Promise<Blob> {
  const headers = await buildHeaders(init);
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    throw new ApiError(res.status, body);
  }
  return res.blob();
}

/** Unwraps the backend's { error: { code, message, detail } } envelope (see ErrorBody.java); falls back for network errors or unexpected shapes. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError && err.body && typeof err.body === "object" && "error" in err.body) {
    const message = (err.body as { error?: { message?: string } }).error?.message;
    if (message) return message;
  }
  return fallback;
}
