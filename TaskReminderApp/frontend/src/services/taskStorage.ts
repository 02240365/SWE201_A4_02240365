import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task } from "../types/task";

const STORAGE_KEY = "taskreminderapp_tasks";

export const TaskStorage = {
  /**
   * Load all tasks from storage.
   */
  async getAll(): Promise<Task[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const tasks: Task[] = JSON.parse(raw);
      // Sort by createdAt descending
      return tasks.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch {
      return [];
    }
  },

  /**
   * Get a single task by ID.
   */
  async getById(id: string): Promise<Task | null> {
    const tasks = await this.getAll();
    return tasks.find((t) => t.id === id) || null;
  },

  /**
   * Save (create or update) a task.
   */
  async save(task: Task): Promise<void> {
    const tasks = await this.getAll();
    const index = tasks.findIndex((t) => t.id === task.id);
    if (index >= 0) {
      tasks[index] = task;
    } else {
      tasks.push(task);
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },

  /**
   * Delete a task by ID.
   */
  async delete(id: string): Promise<void> {
    const tasks = await this.getAll();
    const filtered = tasks.filter((t) => t.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  /**
   * Clear all tasks (for testing).
   */
  async clear(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};
