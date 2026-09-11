export interface OfflineQueueItem {
  id: string;
  type: "VITAL_ENTRY" | "MAR_ADMIN" | "NURSING_NOTE" | "PATIENT_REGISTRATION";
  payload: Record<string, unknown>;
  timestamp: string;
  status: "PENDING" | "SYNCED" | "FAILED";
}

const STORAGE_KEY = "hms_offline_queue_v1";

export function getOfflineQueue(): OfflineQueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToOfflineQueue(type: OfflineQueueItem["type"], payload: Record<string, unknown>): OfflineQueueItem {
  const item: OfflineQueueItem = {
    id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    payload,
    timestamp: new Date().toISOString(),
    status: "PENDING",
  };
  const queue = getOfflineQueue();
  queue.push(item);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  return item;
}

export function clearOfflineQueue(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
