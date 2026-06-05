import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Requests notification permission and returns an Expo push token.
 * Returns null if permission is denied or device is a simulator.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // Push notifications are only supported on physical devices
  if (!Device.isDevice) {
    console.warn("[Push] Must use a physical device for Expo push notifications.");
    // Still return null but allow local notifications on emulator
    return null;
  }

  // Set up Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("task-reminders", {
      name: "Task Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#EC4899",
      sound: "default",
      description: "Notifications for task due-date reminders",
    });

    await Notifications.setNotificationChannelAsync("overdue-alerts", {
      name: "Overdue Alerts",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 200, 500],
      lightColor: "#EF4444",
      sound: "default",
      description: "Urgent notifications for overdue tasks",
    });
  }

  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("[Push] Notification permission not granted.");
    return null;
  }

  // Get Expo push token
  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.warn("[Push] No EAS project ID found. Remote push will not work.");
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log("[Push] Expo push token:", tokenData.data);
    return tokenData.data;
  } catch (err) {
    console.error("[Push] Failed to get push token:", err);
    return null;
  }
}
