"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useTimer } from '@/hooks/useTimer';
import { useTaskList } from '@/hooks/useTaskList';
import { TimerDial } from '@/components/TimerDial/TimerDial';
import { Controls } from '@/components/Controls/Controls';
import { PresetSelector } from '@/components/PresetSelector/PresetSelector';
import { TaskList } from '@/components/TaskList/TaskList';
import { ImportModal } from '@/components/ImportModal/ImportModal';

export default function Home() {
  const { timeLeft, isActive, duration, start, pause, reset, setTime } = useTimer();
  const taskList = useTaskList();
  const prevTimeLeft = useRef(timeLeft);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('import') === '1') {
      setShowImportModal(true);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  useEffect(() => {
    if (prevTimeLeft.current > 0 && timeLeft === 0 && taskList.activeTaskId) {
      taskList.completeTask(taskList.activeTaskId);
    }
    prevTimeLeft.current = timeLeft;
  }, [timeLeft, taskList.activeTaskId, taskList.completeTask]);

  const handleSetTime = (newTime: number) => {
    setTime(newTime);
  };

  const handleToggle = () => {
    if (isActive) {
      pause();
    } else {
      start();
    }
  };

  const handleSelectTask = (id: string) => {
    const task = taskList.tasks.find((t) => t.id === id);
    if (task && !task.completed) {
      taskList.selectTask(id);
      setTime(task.duration);
    }
  };

  const handleImport = () => {
    window.location.href = '/api/auth/google';
  };

  const handleImportEvents = (items: { name: string; duration: number }[]) => {
    taskList.importTasks(items);
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Pomodoro Focus</h1>

        <div className={styles.timerSection}>
          <div className={styles.dialWrapper}>
            <TimerDial
              timeLeft={timeLeft}
              duration={duration}
              onSetTime={handleSetTime}
              isInteractive={!isActive}
            />
          </div>

          <div className={styles.controlsWrapper}>
            <PresetSelector
              onSelect={handleSetTime}
              currentDuration={duration}
            />

            <Controls
              isActive={isActive}
              onToggle={handleToggle}
              onReset={reset}
            />
          </div>
        </div>

        <div className={styles.taskSection}>
          <TaskList
            tasks={taskList.tasks}
            activeTaskId={taskList.activeTaskId}
            currentDuration={duration}
            onSelect={handleSelectTask}
            onAdd={taskList.addTask}
            onRemove={taskList.removeTask}
            onClearCompleted={taskList.clearCompleted}
            onImport={handleImport}
          />
        </div>
      </div>

      <footer className={styles.footer}>
        <Link href="/privacy">Privacy Policy</Link>
        <span className={styles.footerDot}>&middot;</span>
        <Link href="/terms">Terms of Service</Link>
      </footer>

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportEvents}
        />
      )}
    </main>
  );
}
