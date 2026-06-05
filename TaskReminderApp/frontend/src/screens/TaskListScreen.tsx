import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../constants/theme";
import { TaskStorage } from "../services/taskStorage";
import { Task } from "../types/task";
import { cancelTaskNotification } from "../notifications/scheduler";
import TaskCard from "../components/TaskCard";
import EmptyState from "../components/EmptyState";
import FilterBar from "../components/FilterBar";

type Filter = "all" | "pending" | "completed" | "overdue";

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = useCallback(async () => {
    const stored = await TaskStorage.getAll();
    setTasks(stored);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const toggleComplete = async (task: Task) => {
    const updated = { ...task, completed: !task.completed };
    await TaskStorage.save(updated);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
  };

  const deleteTask = (task: Task) => {
    Alert.alert("Delete Task", `Delete "${task.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          // Cancel any scheduled notification
          if (task.notificationId) {
            await cancelTaskNotification(task.notificationId);
          }
          await TaskStorage.delete(task.id);
          setTasks((prev) => prev.filter((t) => t.id !== task.id));
        },
      },
    ]);
  };

  const filteredTasks = tasks.filter((task) => {
    const now = new Date();
    const due = task.dueDate ? new Date(task.dueDate) : null;
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;
    if (filter === "overdue") return !task.completed && due !== null && due < now;
    return true;
  });

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
    overdue: tasks.filter((t) => {
      const due = t.dueDate ? new Date(t.dueDate) : null;
      return !t.completed && due !== null && due < new Date();
    }).length,
  };

  return (
    <View style={styles.container}>
      <FilterBar filter={filter} onFilterChange={setFilter} counts={counts} />

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          filteredTasks.length === 0 && styles.listEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="clipboard-outline"
            title="No tasks here"
            subtitle={
              filter === "all"
                ? "Tap + to create your first task"
                : `No ${filter} tasks`
            }
          />
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggle={() => toggleComplete(item)}
            onPress={() => router.push(`/task/${item.id}`)}
            onDelete={() => deleteTask(item)}
          />
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/task/new")}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.md, gap: SPACING.sm },
  listEmpty: { flex: 1 },
  fab: {
    position: "absolute",
    right: SPACING.lg,
    bottom: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
