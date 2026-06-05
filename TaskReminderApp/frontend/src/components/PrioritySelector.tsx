import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Priority } from "../types/task";
import { COLORS, PRIORITY_COLORS, SPACING } from "../constants/theme";

interface Props {
  value: Priority;
  onChange: (p: Priority) => void;
}

const OPTIONS: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function PrioritySelector({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        const color = PRIORITY_COLORS[opt.value];
        return (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.option,
              active && { backgroundColor: color + "22", borderColor: color },
            ]}
            onPress={() => onChange(opt.value)}
          >
            <View style={[styles.dot, { backgroundColor: active ? color : COLORS.textMuted }]} />
            <Text style={[styles.label, active && { color }]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: SPACING.sm },
  option: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 14, fontWeight: "600", color: COLORS.textMuted },
});
