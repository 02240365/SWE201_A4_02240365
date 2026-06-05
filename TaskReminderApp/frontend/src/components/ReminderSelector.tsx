import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native";
import { COLORS, SPACING } from "../constants/theme";

interface Props {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  minutes: number;
  onMinutesChange: (m: number) => void;
}

const OPTIONS = [
  { label: "5 min", value: 5 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hr", value: 60 },
  { label: "2 hr", value: 120 },
  { label: "1 day", value: 1440 },
];

export default function ReminderSelector({
  enabled,
  onToggle,
  minutes,
  onMinutesChange,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Enable Reminder</Text>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: "#334155", true: COLORS.primary }}
          thumbColor="#fff"
        />
      </View>

      {enabled && (
        <View style={styles.optionsGrid}>
          {OPTIONS.map((opt) => {
            const active = minutes === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => onMinutesChange(opt.value)}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {enabled && (
        <Text style={styles.hint}>
          Notification fires {minutes < 60 ? `${minutes} min` : minutes === 60 ? "1 hr" : minutes === 120 ? "2 hrs" : "1 day"} before the due time
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLabel: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceElevated,
  },
  optionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "22",
  },
  optionText: { fontSize: 13, fontWeight: "600", color: COLORS.textMuted },
  optionTextActive: { color: COLORS.primary },
  hint: { fontSize: 12, color: COLORS.textMuted, fontStyle: "italic" },
});
