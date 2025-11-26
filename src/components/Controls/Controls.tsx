"use client";

import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import styles from './Controls.module.css';

interface ControlsProps {
    isActive: boolean;
    onToggle: () => void;
    onReset: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ isActive, onToggle, onReset }) => {
    return (
        <div className={styles.container}>
            <button
                className={`${styles.button} ${styles.primary}`}
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
