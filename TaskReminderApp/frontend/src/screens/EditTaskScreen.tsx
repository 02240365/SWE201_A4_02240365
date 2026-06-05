import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../constants/theme";
import { TaskStorage } from "../services/taskStorage";
import { Task, Priority } from "../types/task";
import {
  scheduleTaskNotification,
  cancelTaskNotification,
} from "../notifications/scheduler";
import DatePickerField from "../components/DatePickerField";
import PrioritySelector from "../components/PrioritySelector";
import ReminderSelector from "../components/ReminderSelector";

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [reminderMinutes, setReminderMinutes] = useState(30);
  const [enableReminder, setEnableReminder] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) loadTask(id);
  }, [id]);

  const loadTask = async (taskId: string) => {
    const t = await TaskStorage.getById(taskId);
    if (!t) return;
    setTask(t);
    setTitle(t.title);
    setDescription(t.description || "");
    setPriority(t.priority);
    setDueDate(t.dueDate ? new Date(t.dueDate) : null);
    setReminderMinutes(t.reminderMinutes ?? 30);
    setEnableReminder(!!t.notificationId);
  };

  const handleSave = async () => {
    if (!task) return;
    if (!title.trim()) {
      Alert.alert("Validation", "Please enter a task title.");
      return;
    }

    setSaving(true);

    try {
      // Cancel old notification
      if (task.notificationId) {
        await cancelTaskNotification(task.notificationId);
      }

      let notificationId: string | undefined;

      // Schedule new notification if needed
      if (enableReminder && dueDate) {
        const reminderTime = new Date(dueDate.getTime() - reminderMinutes * 60 * 1000);
        if (reminderTime > new Date()) {
          notificationId = await scheduleTaskNotification({
            taskId: task.id,
            title: title.trim(),
            dueDate,
            reminderMinutes,
          });
        }
      }

      const updated: Task = {
        ...task,
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        dueTime: dueDate
          ? dueDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : undefined,
        notificationId,
        reminderMinutes: enableReminder ? reminderMinutes : undefined,
        updatedAt: new Date().toISOString(),
      };

      await TaskStorage.save(updated);
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update task.");
    } finally {
      setSaving(false);
    }
  };

  if (!task) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.field}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={COLORS.textMuted}
          maxLength={100}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={3}
          maxLength={500}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Priority</Text>
        <PrioritySelector value={priority} onChange={setPriority} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Due Date & Time</Text>
        <DatePickerField value={dueDate} onChange={setDueDate} />
      </View>

      {dueDate && (
        <View style={styles.field}>
          <Text style={styles.label}>Reminder</Text>
          <ReminderSelector
            enabled={enableReminder}
            onToggle={setEnableReminder}
            minutes={reminderMinutes}
            onMinutesChange={setReminderMinutes}
          />
        </View>
      )}

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, gap: SPACING.lg, paddingBottom: 40 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  field: { gap: SPACING.xs },
  label: { fontSize: 12, fontWeight: "700", color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.8 },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
