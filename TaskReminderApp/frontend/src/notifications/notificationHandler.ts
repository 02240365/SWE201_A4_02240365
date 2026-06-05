import * as Notifications from "expo-notifications";

/**
 * Configure how notifications appear when the app is in the foreground.
 * Call this once at app startup (in _layout.tsx).
 */
export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,   // Show banner even in foreground
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}
