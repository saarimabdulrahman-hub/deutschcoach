/**
 * Offline Action Queue — Queue mutations when offline, replay on reconnect
 * "Last write wins" conflict strategy
 * Reference: 05_INTERACTION_PATTERNS/009_Offline_And_Sync_Flow.md
 */

const QUEUE_KEY = "dc_offline_queue";

interface QueuedAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

function getQueue(): QueuedAction[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedAction[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch { /* ignore */ }
}

export function enqueueAction(type: string, payload: any): string {
  const id = `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const action: QueuedAction = { id, type, payload, timestamp: Date.now() };
  const queue = getQueue();
  queue.push(action);
  saveQueue(queue);
  return id;
}

export function dequeueAction(id: string): void {
  const queue = getQueue().filter((a) => a.id !== id);
  saveQueue(queue);
}

export function getPendingActions(): QueuedAction[] {
  return getQueue();
}

export function getPendingCount(): number {
  return getQueue().length;
}

export function clearQueue(): void {
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch { /* ignore */ }
}

export async function flushQueue(processAction: (action: QueuedAction) => Promise<boolean>): Promise<{ synced: number; failed: number }> {
  const queue = getQueue();
  let synced = 0;
  let failed = 0;

  for (const action of queue) {
    try {
      const success = await processAction(action);
      if (success) {
        dequeueAction(action.id);
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
      break; // Stop on first failure (likely still offline)
    }
  }

  return { synced, failed };
}
