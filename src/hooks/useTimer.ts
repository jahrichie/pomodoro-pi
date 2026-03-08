import { useState, useEffect, useRef, useCallback } from 'react';

export interface TimerState {
  timeLeft: number; // in seconds
  isActive: boolean;
  isAlarm: boolean;
  isBreak: boolean;
  duration: number; // total duration in seconds
}

export const useTimer = (initialDuration: number = 15 * 60) => {
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isActive, setIsActive] = useState(false);
  const [isAlarm, setIsAlarm] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [duration, setDuration] = useState(initialDuration);

  const endTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const savedWorkDurationRef = useRef<number>(initialDuration);

  const start = useCallback(() => {
    if (isActive || isAlarm) return;

    setIsActive(true);
    endTimeRef.current = Date.now() + timeLeft * 1000;

    const tick = () => {
      if (!endTimeRef.current) return;

      const now = Date.now();
      const remaining = Math.ceil((endTimeRef.current - now) / 1000);

      if (remaining <= 0) {
        setTimeLeft(0);
        setIsActive(false);
        setIsAlarm(true);
        endTimeRef.current = null;
      } else {
        setTimeLeft(remaining);
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [isActive, isAlarm, timeLeft]);

  const pause = useCallback(() => {
    if (!isActive) return;

    setIsActive(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    endTimeRef.current = null;
  }, [isActive]);

  const reset = useCallback(() => {
    pause();
    setIsAlarm(false);
    if (isBreak) {
      setIsBreak(false);
      setDuration(savedWorkDurationRef.current);
      setTimeLeft(savedWorkDurationRef.current);
    } else {
      setTimeLeft(duration);
    }
  }, [pause, duration, isBreak]);

  const setTime = useCallback((newDuration: number) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    endTimeRef.current = null;
    setIsActive(false);
    setIsAlarm(false);
    setIsBreak(false);
    setDuration(newDuration);
    setTimeLeft(newDuration);
  }, []);

  const startBreak = useCallback((breakDuration: number) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    endTimeRef.current = null;

    savedWorkDurationRef.current = duration;

    setIsAlarm(false);
    setIsBreak(true);
    setIsActive(true);
    setDuration(breakDuration);
    setTimeLeft(breakDuration);

    endTimeRef.current = Date.now() + breakDuration * 1000;

    const tick = () => {
      if (!endTimeRef.current) return;
      const now = Date.now();
      const remaining = Math.ceil((endTimeRef.current - now) / 1000);
      if (remaining <= 0) {
        setTimeLeft(0);
        setIsActive(false);
        setIsAlarm(true);
        endTimeRef.current = null;
      } else {
        setTimeLeft(remaining);
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [duration]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    timeLeft,
    isActive,
    isAlarm,
    isBreak,
    duration,
    start,
    pause,
    reset,
    setTime,
    startBreak,
  };
};
