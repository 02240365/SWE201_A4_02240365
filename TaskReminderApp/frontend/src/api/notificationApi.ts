const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || "";

/**
 * Generic fetch helper with error handling.
 */
async function apiRequest(
  path: string,
  method: "GET" | "POST" | "DELETE",
  body?: object,
  requiresAuth = false
): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requiresAuth && API_KEY) {
    headers["x-api-key"] = API_KEY;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

/**
 * Register this device's Expo push token with the backend.
 */
export async function registerTokenWithBackend(
  deviceId: string,
  token: string,
  userId?: string
): Promise<void> {
  await apiRequest("/api/tokens/register", "POST", { deviceId, token, userId });
}

/**
 * Trigger a remote push notification to a specific device (admin action).
 */
export async function sendRemoteNotification(
  deviceId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  await apiRequest(
    "/api/notify/device",
    "POST",
    { deviceId, title, body, data },
    true
  );
}

/**
 * Trigger a task-reminder notification from the server.
 */
export async function sendRemoteTaskReminder(
  deviceId: string,
  taskId: string,
  taskTitle: string,
  dueTime?: string
): Promise<void> {
  await apiRequest(
    "/api/notify/task-reminder",
    "POST",
    { deviceId, taskId, taskTitle, dueTime },
    true
  );
}
