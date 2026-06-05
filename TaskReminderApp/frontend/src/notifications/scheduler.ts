import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

interface ScheduleTaskParams {
  taskId: string;
  title: string;
  dueDate: Date;
  reminderMinutes: number;
}

/**
 * Schedules a local notification for a task reminder.
 * The notification fires `reminderMinutes` before the task's due date.
 * Returns the notification identifier string.
 */
export async function scheduleTaskNotification(
  params: ScheduleTaskParams
): Promise<string> {
  const { taskId, title, dueDate, reminderMinutes } = params;

  const triggerDate = new Date(dueDate.getTime() - reminderMinutes * 60 * 1000);

  const body =
    reminderMinutes === 0
      ? `"${title}" is due now!`
      : reminderMinutes < 60
      ? `"${title}" is due in ${reminderMinutes} minutes`
      : `"${title}" is due in ${reminderMinutes / 60} hour${reminderMinutes / 60 > 1 ? "s" : ""}`;

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Task Reminder",
      body,
      sound: "default",
      data: {
        type: "task-reminder",
        taskId,
        screen: `/task/${taskId}`,
      },
      // Android-specific
      ...(Platform.OS === "android" && {
        channelId: "task-reminders",
        color: "#EC4899",
      }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });

  console.log(
    `[Scheduler] Scheduled notification ${identifier} for task "${title}" at ${triggerDate.toISOString()}`
  );

  return identifier;
}

/**
 * Cancels a previously scheduled local notification.
 * @param notificationId - The identifier returned by scheduleTaskNotification
 */
export async function cancelTaskNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`[Scheduler] Cancelled notification ${notificationId}`);
  } catch (err) {
    console.warn("[Scheduler] Failed to cancel notification:", err);
  }
}

/**
 * Returns all currently scheduled notifications (for debugging).
 */
export async function getAllScheduledNotifications() {
  return Notifications.getAllScheduledNotificationsAsync();
}
