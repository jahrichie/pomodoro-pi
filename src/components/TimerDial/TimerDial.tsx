"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import styles from './TimerDial.module.css';
import { formatTime } from '@/utils/time';

interface TimerDialProps {
    timeLeft: number;
    duration: number;
    onSetTime: (time: number) => void;
    isInteractive?: boolean;
}

export const TimerDial: React.FC<TimerDialProps> = ({
    timeLeft,
    duration,
    onSetTime,
    isInteractive = true
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [, setDragTick] = useState(0);
    const lastAngleRef = useRef<number | null>(null);
    const totalRotationRef = useRef<number>(0);

    // Constants for the circle
    const size = 300;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    // Sync internal rotation state with props when not dragging
    useEffect(() => {
        if (!isDragging) {
            // Convert duration to degrees (1 min = 6 degrees)
            // We want 60 mins = 360 degrees
            // So 1 second = 360 / 3600 = 0.1 degrees
            totalRotationRef.current = timeLeft * 0.1;
        }
    }, [timeLeft, isDragging]);

    const rawAngle = isDragging
        ? ((totalRotationRef.current % 360) + 360) % 360
        : ((timeLeft % 3600) / 3600) * 360;
    const effectiveAngle = (rawAngle === 0 && (isDragging ? totalRotationRef.current > 0 : timeLeft > 0))
        ? 360
        : rawAngle;
    const visualProgress = effectiveAngle / 360;
    const strokeDashoffset = circumference - visualProgress * circumference;

    const getAngleFromPointer = useCallback((clientX: number, clientY: number): number => {
        const svg = svgRef.current;
        if (!svg) return 0;

        const rect = svg.getBoundingClientRect();
        const x = clientX - rect.left - rect.width / 2;
        const y = clientY - rect.top - rect.height / 2;
        let d = Math.atan2(y, x) * (180 / Math.PI) + 90;
        return d < 0 ? d + 360 : d;
    }, []);

    const handleInteraction = useCallback((clientX: number, clientY: number, isStart: boolean = false) => {
        if (!svgRef.current || !isInteractive) return;

        const degrees = getAngleFromPointer(clientX, clientY);

        if (isStart) {
            const prevAngle = ((totalRotationRef.current % 360) + 360) % 360;
            let angleDiff = degrees - prevAngle;
            if (angleDiff > 180) angleDiff -= 360;
            if (angleDiff < -180) angleDiff += 360;
            totalRotationRef.current = Math.max(0, totalRotationRef.current + angleDiff);
            lastAngleRef.current = degrees;
            const rawSeconds = totalRotationRef.current * 10;
            const snappedSeconds = Math.round(rawSeconds / 60) * 60;
            onSetTime(snappedSeconds);
            return;
        }

        if (lastAngleRef.current !== null) {
            let delta = degrees - lastAngleRef.current;

            // Handle wrapping
            if (delta > 180) delta -= 360;
            if (delta < -180) delta += 360;

            // Update total rotation (1 full rotation = 60 mins)
            // We store rotation in "minutes-degrees" where 360 deg = 60 min
            // Actually let's store in raw degrees of rotation
            totalRotationRef.current += delta;

            // Clamp to 0 minimum
            if (totalRotationRef.current < 0) totalRotationRef.current = 0;

            // Convert rotation to seconds
            // 360 degrees = 3600 seconds
            // 1 degree = 10 seconds
            const rawSeconds = totalRotationRef.current * 10;

            // Snap to nearest minute (60s)
            const snappedSeconds = Math.round(rawSeconds / 60) * 60;

            onSetTime(snappedSeconds);
            lastAngleRef.current = degrees;
            setDragTick((t) => t + 1);
        }
    }, [isInteractive, onSetTime, getAngleFromPointer]);

    const handleInteractionRef = useRef(handleInteraction);
    handleInteractionRef.current = handleInteraction;

    const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isInteractive) return;
        const isTouch = 'touches' in e;
        if (isTouch) (e as React.TouchEvent).preventDefault();
        const x = isTouch ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
        const y = isTouch ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
        const touchId = isTouch ? (e as React.TouchEvent).touches[0].identifier : null;

        setIsDragging(true);
        handleInteractionRef.current(x, y, true);

        const onMove = (moveEvent: MouseEvent | TouchEvent) => {
            let moveX: number, moveY: number;
            if ('touches' in moveEvent) {
                moveEvent.preventDefault();
                const touch = touchId !== null
                    ? Array.from(moveEvent.touches).find((t) => t.identifier === touchId)
                    : moveEvent.touches[0];
                if (!touch) return;
                moveX = touch.clientX;
                moveY = touch.clientY;
            } else {
                moveX = moveEvent.clientX;
                moveY = moveEvent.clientY;
            }
            handleInteractionRef.current(moveX, moveY);
        };

        const onEnd = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onEnd);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onEnd);
            window.removeEventListener('touchcancel', onEnd);
            setIsDragging(false);
            lastAngleRef.current = null;
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onEnd);
        window.addEventListener('touchcancel', onEnd);
    };

    return (
        <div className={styles.container}>
            <svg
                ref={svgRef}
                className={styles.svg}
                viewBox={`0 0 ${size} ${size}`}
                onMouseDown={onPointerDown}
                onTouchStart={onPointerDown}
            >
                {/* Background Track */}
                <circle
                    className={styles.track}
                    cx={center}
                    cy={center}
                    r={radius}
                />

                {/* Progress Arc */}
                <circle
                    className={styles.progress}
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                />

                {/* Interactive Knob */}
                {isInteractive && (
                    <circle
                        className={styles.knob}
                        cx={center + radius * Math.cos(effectiveAngle * (Math.PI / 180))}
                        cy={center + radius * Math.sin(effectiveAngle * (Math.PI / 180))}
                        r={isDragging ? 14 : 12}
                    />
                )}
            </svg>

            <div className={styles.timeDisplay}>
                <div className={styles.timeText}>{formatTime(timeLeft)}</div>
                <div className={styles.label}>{isDragging ? 'SET TIME' : (timeLeft > 0 ? 'REMAINING' : 'DONE')}</div>
            </div>
        </div>
    );
};
