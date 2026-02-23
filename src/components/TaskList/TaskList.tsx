"use client";

import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import clsx from 'clsx';
import styles from './TaskList.module.css';
import type { Task } from '@/hooks/useTaskList';
import { formatMinutes } from '@/utils/time';

interface TaskListProps {
    tasks: Task[];
    activeTaskId: string | null;
    currentDuration: number;
    onSelect: (id: string) => void;
    onAdd: (name: string, duration: number) => void;
    onRemove: (id: string) => void;
    onClearCompleted: () => void;
    onImport: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
    tasks,
    activeTaskId,
    currentDuration,
    onSelect,
    onAdd,
    onRemove,
    onClearCompleted,
    onImport,
}) => {
    const [newName, setNewName] = useState('');
    const hasCompleted = tasks.some((t) => t.completed);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newName.trim();
        if (!trimmed) return;
        onAdd(trimmed, currentDuration);
        setNewName('');
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <span className={styles.heading}>Tasks</span>
                {hasCompleted && (
                    <button className={styles.clearBtn} onClick={onClearCompleted}>
                        Clear done
                    </button>
                )}
            </div>

            {tasks.length === 0 ? (
                <div className={styles.empty}>
                    No tasks yet. Add one below or import from Google Calendar.
                </div>
            ) : (
                <div className={styles.list}>
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className={clsx(
                                styles.task,
                                task.id === activeTaskId && styles.taskActive,
                                task.completed && styles.taskCompleted
                            )}
                            onClick={() => !task.completed && onSelect(task.id)}
                        >
                            <div
                                className={clsx(
                                    styles.taskSource,
                                    task.source === 'gcal' && styles.taskSourceGcal
                                )}
                            />
                            <div className={styles.taskInfo}>
                                <div className={styles.taskName}>{task.name}</div>
                                <div className={styles.taskDuration}>
                                    {formatMinutes(task.duration)}
                                </div>
                            </div>
                            <button
                                className={styles.deleteBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(task.id);
                                }}
                                aria-label="Remove task"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <form className={styles.addForm} onSubmit={handleSubmit}>
                <input
                    className={styles.addInput}
                    type="text"
                    placeholder="Add a task..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <button className={styles.addBtn} type="submit">
                    Add ({formatMinutes(currentDuration)})
                </button>
            </form>

            <button className={styles.importBtn} onClick={onImport}>
                <Calendar size={14} />
                Import from Google Calendar
            </button>
        </div>
    );
};
