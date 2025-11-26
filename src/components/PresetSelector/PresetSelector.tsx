"use client";

import React from 'react';
import styles from './PresetSelector.module.css';

interface PresetSelectorProps {
    onSelect: (minutes: number) => void;
    currentDuration: number;
}

const PRESETS = [15, 30, 60];

export const PresetSelector: React.FC<PresetSelectorProps> = ({ onSelect, currentDuration }) => {
    return (
        <div className={styles.container}>
            {PRESETS.map((mins) => (
                <button
                    key={mins}
                    className={`${styles.button} ${currentDuration === mins * 60 ? styles.active : ''}`}
                    onClick={() => onSelect(mins * 60)}
                >
                    {mins}
                </button>
            ))}
        </div>
    );
};
