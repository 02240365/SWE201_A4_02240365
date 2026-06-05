import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../constants/theme";
import { TaskStorage } from "../services/taskStorage";
import { Task } from "../types/task";
import { cancelTaskNotification } from "../notifications/scheduler";
import { formatDate, formatTime, getPriorityColor, isOverdue } from "../utils/taskUtils";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    if (id) loadTask(id);
  }, [id]);

  const loadTask = async (taskId: string) => {
    const t = await TaskStorage.getById(taskId);
    setTask(t);
  };

  const toggleComplete = async () => {
    if (!task) return;
    const updated = { ...task, completed: !task.completed };
    await TaskStorage.save(updated);
    setTask(updated);
  };

  const handleDelete = () => {
    Alert.alert("Delete Task", `Delete "${task?.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (task?.notificationId) {
            await cancelTaskNotification(task.notificationId);
          }
          if (task) await TaskStorage.delete(task.id);
          router.back();
        },
      },
    ]);
  };

  if (!task) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFound}>Task not found</Text>
      </View>
    );
  }

  const overdue = isOverdue(task);
  const priorityColor = getPriorityColor(task.priority);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Banner */}
      {overdue && !task.completed && (
        <View style={styles.overdueBanner}>
          <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
          <Text style={styles.overdueText}>This task is overdue</Text>
        </View>
      )}

      {/* Title & Priority */}
      <View style={styles.header}>
        <View style={[styles.priorityBadge, { backgroundColor: priorityColor + "22" }]}>
          <Text style={[styles.priorityText, { color: priorityColor }]}>
            {task.priority.toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.title, task.completed && styles.titleDone]}>{task.title}</Text>
      </View>

      {/* Description */}
      {task.description ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.sectionLabel}>Description</Text>
          </View>
          <Text style={styles.description}>{task.description}</Text>
        </View>
      ) : null}

      {/* Due Date & Time */}
      {task.dueDate && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.sectionLabel}>Due Date</Text>
          </View>
          <Text style={styles.detailValue}>{formatDate(task.dueDate)}</Text>
          {task.dueTime && (
            <Text style={styles.detailSub}>{formatTime(task.dueTime)}</Text>
          )}
        </View>
      )}

      {/* Notification */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="notifications-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.sectionLabel}>Notification</Text>
        </View>
        <View style={[styles.notifBadge, { backgroundColor: task.notificationId ? COLORS.success + "22" : "#33415522" }]}>
          <View style={[styles.dot, { backgroundColor: task.notificationId ? COLORS.success : "#64748B" }]} />
          <Text style={[styles.notifText, { color: task.notificationId ? COLORS.success : "#64748B" }]}>
            {task.notificationId ? "Reminder scheduled" : "No reminder set"}
          </Text>
        </View>
        {task.reminderMinutes !== undefined && task.reminderMinutes > 0 && (
          <Text style={styles.detailSub}>
            Notifies {task.reminderMinutes} minutes before due time
          </Text>
        )}
      </View>

      {/* Status */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.sectionLabel}>Status</Text>
        </View>
        <Text style={[styles.detailValue, { color: task.completed ? COLORS.success : COLORS.warning }]}>
          {task.completed ? "Completed" : overdue ? "Overdue" : "Pending"}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={toggleComplete}>
          <Ionicons
            name={task.completed ? "close-circle-outline" : "checkmark-circle-outline"}
            size={20}
            color={task.completed ? COLORS.textSecondary : COLORS.success}
          />
          <Text style={[styles.actionBtnText, { color: task.completed ? COLORS.textSecondary : COLORS.success }]}>
            {task.completed ? "Mark Pending" : "Mark Done"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnSecondary]}
          onPress={() => router.push(`/task/edit/${task.id}`)}
        >
          <Ionicons name="pencil-outline" size={20} color={COLORS.primary} />
          <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
          <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, gap: SPACING.lg, paddingBottom: 40 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFound: { color: COLORS.textMuted, fontSize: 16 },
  overdueBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.danger + "18",
    padding: SPACING.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.danger + "40",
  },
  overdueText: { color: COLORS.danger, fontSize: 13, fontWeight: "600" },
  header: { gap: SPACING.xs },
  priorityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  priorityText: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.text, lineHeight: 30 },
  titleDone: { textDecorationLine: "line-through", color: COLORS.textMuted },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.8 },
  description: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  detailValue: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  detailSub: { fontSize: 13, color: COLORS.textMuted },
  notifBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  notifText: { fontSize: 13, fontWeight: "600" },
  actions: { gap: SPACING.sm },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: SPACING.md,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnSecondary: { borderColor: COLORS.primary + "40" },
  actionBtnDanger: { borderColor: COLORS.danger + "40" },
  actionBtnText: { fontSize: 15, fontWeight: "700" },
});
