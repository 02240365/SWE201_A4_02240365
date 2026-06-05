import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../constants/theme";
import { registerForPushNotifications } from "../notifications/permissionHandler";
import { registerTokenWithBackend } from "../api/notificationApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const STORAGE_KEYS = {
  DAILY_REMINDER: "settings_daily_reminder",
  OVERDUE_ALERT: "settings_overdue_alert",
  PUSH_ENABLED: "settings_push_enabled",
  DEVICE_ID: "device_id",
  PUSH_TOKEN: "push_token",
};

export default function SettingsScreen() {
  const [permissionStatus, setPermissionStatus] = useState<string>("unknown");
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [overdueAlert, setOverdueAlert] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPermission();
  }, []);

  const loadSettings = async () => {
    const [daily, overdue, push, token] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.DAILY_REMINDER),
      AsyncStorage.getItem(STORAGE_KEYS.OVERDUE_ALERT),
      AsyncStorage.getItem(STORAGE_KEYS.PUSH_ENABLED),
      AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN),
    ]);
    setDailyReminder(daily !== "false");
    setOverdueAlert(overdue !== "false");
    setPushEnabled(push === "true");
    setPushToken(token);
  };

  const checkPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
  };

  const handleRequestPermission = async () => {
    setLoading(true);
    const token = await registerForPushNotifications();
    setLoading(false);

    if (token) {
      setPushToken(token);
      await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
      setPermissionStatus("granted");
    } else {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
    }
  };

  const handleRegisterToken = async () => {
    if (!pushToken) {
      Alert.alert("No Token", "Please request notification permission first.");
      return;
    }
    setRegistering(true);
    try {
      let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      if (!deviceId) {
        deviceId = `device_${Date.now()}`;
        await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
      }
      await registerTokenWithBackend(deviceId, pushToken);
      await AsyncStorage.setItem(STORAGE_KEYS.PUSH_ENABLED, "true");
      setPushEnabled(true);
      Alert.alert("Success", "Device registered for push notifications.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to register token.");
    } finally {
      setRegistering(false);
    }
  };

  const saveToggle = async (key: string, value: boolean) => {
    await AsyncStorage.setItem(key, String(value));
  };

  const permissionColor =
    permissionStatus === "granted"
      ? COLORS.success
      : permissionStatus === "denied"
      ? COLORS.danger
      : COLORS.warning;

  const permissionLabel =
    permissionStatus === "granted"
      ? "Granted"
      : permissionStatus === "denied"
      ? "Denied"
      : "Not Requested";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Permission Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Permissions</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.textSecondary} />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Permission Status</Text>
              <View style={[styles.badge, { backgroundColor: permissionColor + "22" }]}>
                <View style={[styles.dot, { backgroundColor: permissionColor }]} />
                <Text style={[styles.badgeText, { color: permissionColor }]}>
                  {permissionLabel}
                </Text>
              </View>
            </View>
          </View>

          {permissionStatus !== "granted" && (
            <>
              {permissionStatus === "denied" && (
                <Text style={styles.deniedNote}>
                  Permission was denied. Please enable notifications in your device Settings app.
                </Text>
              )}
              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleRequestPermission}
                disabled={loading || permissionStatus === "denied"}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="key-outline" size={16} color="#fff" />
                    <Text style={styles.btnText}>Request Permission</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Push Token Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Remote Push Notifications</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="phone-portrait-outline" size={22} color={COLORS.textSecondary} />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Push Token</Text>
              <Text style={styles.tokenText} numberOfLines={1}>
                {pushToken ? pushToken.slice(0, 36) + "..." : "Not obtained"}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <Ionicons name="cloud-outline" size={22} color={COLORS.textSecondary} />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Registered with Server</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: (pushEnabled ? COLORS.success : COLORS.textMuted) + "22" },
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: pushEnabled ? COLORS.success : COLORS.textMuted },
                  ]}
                />
                <Text
                  style={[
                    styles.badgeText,
                    { color: pushEnabled ? COLORS.success : COLORS.textMuted },
                  ]}
                >
                  {pushEnabled ? "Registered" : "Not registered"}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.btn,
              (!pushToken || registering) && styles.btnDisabled,
            ]}
            onPress={handleRegisterToken}
            disabled={!pushToken || registering}
          >
            {registering ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                <Text style={styles.btnText}>Register Token with Server</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Local Notification Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Local Notification Preferences</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Ionicons name="sunny-outline" size={22} color={COLORS.textSecondary} />
              <View>
                <Text style={styles.rowLabel}>Daily Reminders</Text>
                <Text style={styles.rowSub}>Get reminded about pending tasks each morning</Text>
              </View>
            </View>
            <Switch
              value={dailyReminder}
              onValueChange={(v) => {
                setDailyReminder(v);
                saveToggle(STORAGE_KEYS.DAILY_REMINDER, v);
              }}
              trackColor={{ false: "#334155", true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.toggleRow, styles.toggleRowBorder]}>
            <View style={styles.toggleLeft}>
              <Ionicons name="warning-outline" size={22} color={COLORS.textSecondary} />
              <View>
                <Text style={styles.rowLabel}>Overdue Alerts</Text>
                <Text style={styles.rowSub}>Alert when tasks become overdue</Text>
              </View>
            </View>
            <Switch
              value={overdueAlert}
              onValueChange={(v) => {
                setOverdueAlert(v);
                saveToggle(STORAGE_KEYS.OVERDUE_ALERT, v);
              }}
              trackColor={{ false: "#334155", true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Info</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="information-circle-outline" size={22} color={COLORS.textSecondary} />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Version</Text>
              <Text style={styles.rowValue}>1.0.0</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, gap: SPACING.lg, paddingBottom: 40 },
  section: { gap: SPACING.xs },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  rowContent: { flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowLabel: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  rowSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  rowValue: { fontSize: 14, color: COLORS.textSecondary },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  tokenText: { fontSize: 11, color: COLORS.textMuted, maxWidth: 180 },
  deniedNote: {
    fontSize: 13,
    color: COLORS.danger,
    backgroundColor: COLORS.danger + "15",
    padding: SPACING.sm,
    borderRadius: 10,
    lineHeight: 19,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleRowBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  toggleLeft: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.sm, flex: 1 },
});
