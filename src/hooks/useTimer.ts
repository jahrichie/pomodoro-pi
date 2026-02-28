import { useState, useEffect, useRef, useCallback } from 'react';

export interface TimerState {
  timeLeft: number; // in seconds
  isActive: boolean;
  isAlarm: boolean;
  duration: number; // total duration in seconds
}

export const useTimer = (initialDuration: number = 15 * 60) => {
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isActive, setIsActive] = useState(false);
  const [isAlarm, setIsAlarm] = useState(false);
  const [duration, setDuration] = useState(initialDuration);
  
  const endTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

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
    setTimeLeft(duration);
  }, [pause, duration]);

  const setTime = useCallback((newDuration: number) => {
    pause();
    setIsAlarm(false);
    setDuration(newDuration);
    setTimeLeft(newDuration);
  }, [pause]);

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
    duration,
    start,
    pause,
    reset,
    setTime
  };
};
