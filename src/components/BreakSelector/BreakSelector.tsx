"use client";

import React from 'react';
import styles from './BreakSelector.module.css';

interface BreakSelectorProps {
    onSelect: (seconds: number) => void;
    currentBreakDuration: number;
}

const BREAK_PRESETS = [5, 10, 15, 30];

export const BreakSelector: React.FC<BreakSelectorProps> = ({ onSelect, currentBreakDuration }) => {
    return (
        <div className={styles.container}>
            <span className={styles.label}>Break</span>
            {BREAK_PRESETS.map((mins) => (
                <button
                    key={mins}
                    className={`${styles.button} ${currentBreakDuration === mins * 60 ? styles.active : ''}`}
                    onClick={() => onSelect(mins * 60)}
                >
                    {mins}
                </button>
            ))}
        </div>
    );
};
