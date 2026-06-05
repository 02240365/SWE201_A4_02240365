import { Task } from "../types/task";
import { COLORS, PRIORITY_COLORS } from "../constants/theme";

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(time: string): string {
  return time;
}

export function isOverdue(task: Task): boolean {
  if (task.completed || !task.dueDate) return false;
  return new Date(task.dueDate) < new Date();
}

export function getPriorityColor(priority: string): string {
  return PRIORITY_COLORS[priority] ?? COLORS.textMuted;
}

export function getDueDateLabel(dueDate?: string): string {
  if (!dueDate) return "";
  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) return "Overdue";
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays < 7) return `Due in ${diffDays} days`;
  return formatDate(dueDate);
}
