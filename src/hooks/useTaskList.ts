"use client";

import { useState, useEffect, useCallback } from 'react';

export interface Task {
  id: string;
  name: string;
  duration: number;
  source: 'manual' | 'gcal';
  completed: boolean;
}

const STORAGE_KEY = 'pomodoro-pi-tasks';

function loadTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch { /* quota exceeded, silently fail */ }
}

export const useTaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTasks(loadTasks());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveTasks(tasks);
  }, [tasks, hydrated]);

  const addTask = useCallback((name: string, duration: number, source: 'manual' | 'gcal' = 'manual') => {
    const task: Task = {
      id: crypto.randomUUID(),
      name,
      duration,
      source,
      completed: false,
    };
    setTasks((prev) => [...prev, task]);
    return task;
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setActiveTaskId((prev) => (prev === id ? null : prev));
  }, []);

  const completeTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: true } : t))
    );
  }, []);

  const updateTaskDuration = useCallback((id: string, duration: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, duration } : t))
    );
  }, []);

  const selectTask = useCallback((id: string | null) => {
    setActiveTaskId(id);
  }, []);

  const importTasks = useCallback((items: { name: string; duration: number }[]) => {
    const newTasks: Task[] = items.map((item) => ({
      id: crypto.randomUUID(),
      name: item.name,
      duration: item.duration,
      source: 'gcal' as const,
      completed: false,
    }));
    setTasks((prev) => [...prev, ...newTasks]);
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  }, []);

  const activeTask = tasks.find((t) => t.id === activeTaskId) ?? null;

  return {
    tasks,
    activeTask,
    activeTaskId,
    hydrated,
    addTask,
    removeTask,
    completeTask,
    updateTaskDuration,
    selectTask,
    importTasks,
    clearCompleted,
  };
};
