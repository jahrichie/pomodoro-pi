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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mac-app-store-badge.svg"
            alt="Download on the Mac App Store"
            className={styles.appStoreBadge}
          />
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
