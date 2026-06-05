export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;       // ISO string
  dueTime?: string;       // human readable "10:30 AM"
  completed: boolean;
  notificationId?: string; // Expo notification identifier
  reminderMinutes?: number;
  createdAt: string;
  updatedAt?: string;
}
