"use client";

import React from 'react';
import styles from './page.module.css';
import { useTimer } from '@/hooks/useTimer';
import { TimerDial } from '@/components/TimerDial/TimerDial';
import { Controls } from '@/components/Controls/Controls';
import { PresetSelector } from '@/components/PresetSelector/PresetSelector';

export default function Home() {
  const { timeLeft, isActive, duration, start, pause, reset, setTime } = useTimer();

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

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Pomodoro Pi</h1>

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
    </main>
  );
}
