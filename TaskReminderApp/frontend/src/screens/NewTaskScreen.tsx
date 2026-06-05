import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../constants/theme";
import { TaskStorage } from "../services/taskStorage";
import { Task, Priority } from "../types/task";
import { scheduleTaskNotification } from "../notifications/scheduler";
import DatePickerField from "../components/DatePickerField";
import PrioritySelector from "../components/PrioritySelector";
import ReminderSelector from "../components/ReminderSelector";

export default function NewTaskScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [reminderMinutes, setReminderMinutes] = useState<number>(30);
  const [enableReminder, setEnableReminder] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Please enter a task title.");
      return;
    }

    setSaving(true);

    try {
      const taskId = uuidv4();
      let notificationId: string | undefined;

      // Schedule local notification if a due date + reminder is set
      if (enableReminder && dueDate) {
        const reminderTime = new Date(dueDate.getTime() - reminderMinutes * 60 * 1000);
        if (reminderTime > new Date()) {
          notificationId = await scheduleTaskNotification({
            taskId,
            title: title.trim(),
            dueDate,
            reminderMinutes,
          });
        }
      }

      const newTask: Task = {
        id: taskId,
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        dueTime: dueDate
          ? dueDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : undefined,
        completed: false,
        notificationId,
        reminderMinutes: enableReminder ? reminderMinutes : undefined,
        createdAt: new Date().toISOString(),
      };

      await TaskStorage.save(newTask);
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save task. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Title */}
      <View style={styles.field}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="What needs to be done?"
          placeholderTextColor={COLORS.textMuted}
          maxLength={100}
          autoFocus
        />
      </View>

      {/* Description */}
      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Add more details..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={3}
          maxLength={500}
        />
      </View>

      {/* Priority */}
      <View style={styles.field}>
        <Text style={styles.label}>Priority</Text>
        <PrioritySelector value={priority} onChange={setPriority} />
      </View>

      {/* Due Date */}
      <View style={styles.field}>
        <Text style={styles.label}>Due Date & Time</Text>
        <DatePickerField value={dueDate} onChange={setDueDate} />
      </View>

      {/* Reminder */}
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

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.saveBtnText}>Create Task</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, gap: SPACING.lg, paddingBottom: 40 },
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
    marginTop: SPACING.sm,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
