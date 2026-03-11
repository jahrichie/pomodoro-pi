"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useTimer } from '@/hooks/useTimer';
import { useTaskList } from '@/hooks/useTaskList';
import { TimerDial } from '@/components/TimerDial/TimerDial';
import { Controls } from '@/components/Controls/Controls';
import { PresetSelector } from '@/components/PresetSelector/PresetSelector';
import { BreakSelector } from '@/components/BreakSelector/BreakSelector';
import { TaskList } from '@/components/TaskList/TaskList';
import { ImportModal } from '@/components/ImportModal/ImportModal';

function playAlarmChime(ctx: AudioContext) {
  const frequencies = [587.33, 783.99, 659.25];
  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.15 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.15);
    osc.stop(ctx.currentTime + i * 0.15 + 0.6);
  });
}

function triggerVibration() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([150, 80, 150, 80, 200]);
  }
}

export default function Home() {
  const { timeLeft, isActive, isAlarm, isBreak, duration, start, pause, reset, setTime, startBreak } = useTimer();
  const taskList = useTaskList();
  const prevTimeLeft = useRef(timeLeft);
  const [showImportModal, setShowImportModal] = useState(false);
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('import') === '1') {
      setShowImportModal(true);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  useEffect(() => {
    if (prevTimeLeft.current > 0 && timeLeft === 0 && taskList.activeTaskId && !isBreak) {
      taskList.completeTask(taskList.activeTaskId);
    }
    prevTimeLeft.current = timeLeft;
  }, [timeLeft, taskList.activeTaskId, taskList.completeTask, isBreak]);

  const stopAlarmEffects = useCallback(() => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isAlarm) {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      playAlarmChime(ctx);
      triggerVibration();

      alarmIntervalRef.current = setInterval(() => {
        playAlarmChime(ctx);
        triggerVibration();
      }, 3000);
    } else {
      stopAlarmEffects();
    }

    return stopAlarmEffects;
  }, [isAlarm, stopAlarmEffects]);

  const handleReset = useCallback(() => {
    stopAlarmEffects();
    reset();
  }, [stopAlarmEffects, reset]);

  const handleStartBreak = useCallback(() => {
    stopAlarmEffects();
    startBreak(breakDuration);
  }, [stopAlarmEffects, startBreak, breakDuration]);

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

  const dialWrapperClass = [
    styles.dialWrapper,
    isAlarm ? styles.dialWrapperAlarm : '',
    isBreak && !isAlarm ? styles.dialWrapperBreak : '',
  ].filter(Boolean).join(' ');

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Pomodoro Focus</h1>

        <div className={styles.timerSection}>
          <div className={dialWrapperClass}>
            <TimerDial
              timeLeft={timeLeft}
              duration={duration}
              onSetTime={handleSetTime}
              isInteractive={!isActive && !isAlarm}
              isAlarm={isAlarm}
              isBreak={isBreak}
            />
          </div>

          <div className={styles.controlsWrapper}>
            <PresetSelector
              onSelect={handleSetTime}
              currentDuration={!isBreak ? duration : -1}
            />

            <BreakSelector
              onSelect={setBreakDuration}
              currentBreakDuration={breakDuration}
            />

            <Controls
              isActive={isActive}
              isAlarm={isAlarm}
              isBreak={isBreak}
              onToggle={handleToggle}
              onReset={handleReset}
              onStartBreak={handleStartBreak}
            />
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
      </div>

      <footer className={styles.footer}>
        <Link href="/privacy">Privacy Policy</Link>
        <span className={styles.footerDot}>&middot;</span>
        <Link href="/terms">Terms of Service</Link>
        <span className={styles.footerDot}>&middot;</span>
        <a
          href="#"
          title="Coming Soon"
          className={styles.appStoreLink}
          onClick={(e) => e.preventDefault()}
          aria-label="Download on the Mac App Store - Coming Soon"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={styles.appStoreIcon}
          >
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
        </a>
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
