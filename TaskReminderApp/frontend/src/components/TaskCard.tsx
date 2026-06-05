import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Task } from "../types/task";
import { COLORS, SPACING } from "../constants/theme";
import { getDueDateLabel, isOverdue, getPriorityColor } from "../utils/taskUtils";

interface Props {
  task: Task;
  onPress: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

export default function TaskCard({ task, onPress, onToggle, onDelete }: Props) {
  const overdue = isOverdue(task);
  const priorityColor = getPriorityColor(task.priority);
  const dueDateLabel = getDueDateLabel(task.dueDate);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      {/* Priority accent bar */}
      <View style={[styles.accent, { backgroundColor: priorityColor }]} />

      <View style={styles.body}>
        {/* Checkbox + Title */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.checkbox, task.completed && styles.checkboxDone]}
            onPress={onToggle}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {task.completed && (
              <Ionicons name="checkmark" size={14} color="#fff" />
            )}
          </TouchableOpacity>

          <Text
            style={[styles.title, task.completed && styles.titleDone]}
            numberOfLines={2}
          >
            {task.title}
          </Text>

          <TouchableOpacity
            onPress={onDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Description preview */}
        {task.description ? (
          <Text style={styles.description} numberOfLines={1}>
            {task.description}
          </Text>
        ) : null}

        {/* Meta row */}
        <View style={styles.meta}>
          {task.dueDate && (
            <View style={styles.metaItem}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color={overdue && !task.completed ? COLORS.danger : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.metaText,
                  overdue && !task.completed && { color: COLORS.danger },
                ]}
              >
                {dueDateLabel}
              </Text>
            </View>
          )}

          {task.notificationId && !task.completed && (
            <View style={styles.metaItem}>
              <Ionicons name="notifications-outline" size={12} color={COLORS.primary} />
              <Text style={[styles.metaText, { color: COLORS.primary }]}>Reminder set</Text>
            </View>
          )}

          <View style={[styles.priorityChip, { backgroundColor: priorityColor + "20" }]}>
            <Text style={[styles.priorityText, { color: priorityColor }]}>
              {task.priority}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardPressed: { opacity: 0.8 },
  accent: { width: 4 },
  body: { flex: 1, padding: SPACING.md, gap: SPACING.xs },
  row: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  title: { flex: 1, fontSize: 15, fontWeight: "600", color: COLORS.text, lineHeight: 21 },
  titleDone: { textDecorationLine: "line-through", color: COLORS.textMuted },
  description: { fontSize: 13, color: COLORS.textMuted, paddingLeft: 30 },
  meta: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, paddingLeft: 30, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: COLORS.textMuted },
  priorityChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
});
