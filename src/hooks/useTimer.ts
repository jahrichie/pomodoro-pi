import { useState, useEffect, useRef, useCallback } from 'react';

export interface TimerState {
  timeLeft: number; // in seconds
  isActive: boolean;
  duration: number; // total duration in seconds
}

export const useTimer = (initialDuration: number = 15 * 60) => {
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(initialDuration);
  
  const endTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (isActive) return;
    
    setIsActive(true);
    // Calculate expected end time based on current timeLeft
    endTimeRef.current = Date.now() + timeLeft * 1000;
    
    const tick = () => {
      if (!endTimeRef.current) return;
      
      const now = Date.now();
      const remaining = Math.ceil((endTimeRef.current - now) / 1000);
      
      if (remaining <= 0) {
        setTimeLeft(0);
        setIsActive(false);
        endTimeRef.current = null;
      } else {
        setTimeLeft(remaining);
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    
    rafRef.current = requestAnimationFrame(tick);
  }, [isActive, timeLeft]);

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
    setTimeLeft(duration);
  }, [pause, duration]);

  const setTime = useCallback((newDuration: number) => {
    pause();
    setDuration(newDuration);
    setTimeLeft(newDuration);
  }, [pause]);

  // Cleanup on unmount
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
    duration,
    start,
    pause,
    reset,
    setTime
  };
};
