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

    // Visual progress is modulo 60 minutes
    const visualProgress = (timeLeft % 3600) / 3600;
    const strokeDashoffset = circumference - visualProgress * circumference;

    // Knob position based on visual progress
    const angle = visualProgress * 360;

    const handleInteraction = useCallback((clientX: number, clientY: number, isStart: boolean = false) => {
        if (!svgRef.current || !isInteractive) return;

        const rect = svgRef.current.getBoundingClientRect();
        const x = clientX - rect.left - center;
        const y = clientY - rect.top - center;

        // Calculate current angle in degrees (0 at top, clockwise)
        let theta = Math.atan2(y, x);
        let degrees = theta * (180 / Math.PI) + 90;
        if (degrees < 0) degrees += 360;

        if (isStart) {
            lastAngleRef.current = degrees;
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
        }
    }, [center, isInteractive, onSetTime]);

    const onMouseDown = (e: React.MouseEvent) => {
        if (!isInteractive) return;
        setIsDragging(true);
        handleInteraction(e.clientX, e.clientY, true);
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        handleInteraction(e.clientX, e.clientY);
    };

    const onMouseUp = () => {
        setIsDragging(false);
        lastAngleRef.current = null;
    };

    const onTouchStart = (e: React.TouchEvent) => {
        if (!isInteractive) return;
        setIsDragging(true);
        handleInteraction(e.touches[0].clientX, e.touches[0].clientY, true);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onTouchEnd = () => {
        setIsDragging(false);
        lastAngleRef.current = null;
    };

    // Global mouse up to catch release outside
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            setIsDragging(false);
            lastAngleRef.current = null;
        };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    return (
        <div className={styles.container}>
            <svg
                ref={svgRef}
                className={styles.svg}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
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
                        cx={center + radius * Math.cos(angle * (Math.PI / 180))}
                        cy={center + radius * Math.sin(angle * (Math.PI / 180))}
                        r={12}
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
