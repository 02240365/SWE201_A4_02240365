import { useEffect, useRef } from "react";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { setupNotificationHandler } from "../notifications/notificationHandler";

// Configure how notifications appear when app is in foreground
setupNotificationHandler();

export default function RootLayout() {
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    // Listener: notification received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("[Foreground] Notification received:", notification);
      }
    );

    // Listener: user tapped a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as Record<string, string>;
        console.log("[Tap] Notification tapped, data:", data);

        // Navigate based on notification type
        if (data?.type === "task-reminder" && data?.taskId) {
          router.push(`/task/${data.taskId}`);
        } else if (data?.screen) {
          router.push(data.screen as any);
        }
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0F172A" },
          headerTintColor: "#F8FAFC",
          headerTitleStyle: { fontWeight: "700", fontSize: 18 },
          contentStyle: { backgroundColor: "#0F172A" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="task/[id]"
          options={{ title: "Task Detail", headerBackTitle: "Back" }}
        />
        <Stack.Screen
          name="task/new"
          options={{ title: "New Task", presentation: "modal" }}
        />
        <Stack.Screen
          name="task/edit/[id]"
          options={{ title: "Edit Task", presentation: "modal" }}
        />
      </Stack>
    </>
  );
}
