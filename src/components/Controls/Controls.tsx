"use client";

import React from 'react';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import styles from './Controls.module.css';

interface ControlsProps {
    isActive: boolean;
    isAlarm?: boolean;
    isBreak?: boolean;
    onToggle: () => void;
    onReset: () => void;
    onStartBreak?: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
    isActive,
    isAlarm = false,
    isBreak = false,
    onToggle,
    onReset,
    onStartBreak,
}) => {
    if (isAlarm && !isBreak) {
        return (
            <div className={styles.container}>
                <button
                    className={`${styles.button} ${styles.startBreak}`}
                    onClick={onStartBreak}
                    aria-label="Start break"
                >
                    <Coffee size={28} />
                </button>
                <button
                    className={`${styles.button} ${styles.secondary}`}
                    onClick={onReset}
                    aria-label="Skip break"
                >
                    <RotateCcw size={24} />
                </button>
            </div>
        );
    }

    if (isAlarm && isBreak) {
        return (
            <div className={styles.container}>
                <button
                    className={`${styles.button} ${styles.resetAlarm}`}
                    onClick={onReset}
                    aria-label="Done"
                >
                    <RotateCcw size={24} />
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <button
                className={`${styles.button} ${isBreak ? styles.primaryBreak : styles.primary}`}
                onClick={onToggle}
                aria-label={isActive ? 'Pause' : 'Start'}
            >
                {isActive ? <Pause size={32} /> : <Play size={32} fill="currentColor" />}
            </button>

            <button
                className={`${styles.button} ${styles.secondary}`}
                onClick={onReset}
                aria-label="Reset"
            >
                <RotateCcw size={24} />
            </button>
        </div>
    );
};
