const STORAGE_KEY = "titer_device_id";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "ssr";

  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
