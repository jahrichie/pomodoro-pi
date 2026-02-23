"use client";

import React, { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import clsx from 'clsx';
import styles from './ImportModal.module.css';

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
}

interface SelectedEvent {
  event: CalendarEvent;
  durationMinutes: number;
}

interface ImportModalProps {
  onClose: () => void;
  onImport: (items: { name: string; duration: number }[]) => void;
}

function formatEventTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImport }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Map<string, SelectedEvent>>(new Map());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/calendar/events');
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        setEvents(data.events || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const toggleEvent = (event: CalendarEvent) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(event.id)) {
        next.delete(event.id);
      } else {
        let defaultMinutes = 25;
        if (event.start && event.end) {
          const diff = (new Date(event.end).getTime() - new Date(event.start).getTime()) / 60000;
          if (diff > 0 && isFinite(diff)) defaultMinutes = Math.round(diff);
        }
        next.set(event.id, { event, durationMinutes: defaultMinutes });
      }
      return next;
    });
  };

  const setDuration = (id: string, minutes: number) => {
    setSelected((prev) => {
      const next = new Map(prev);
      const entry = next.get(id);
      if (entry) {
        next.set(id, { ...entry, durationMinutes: minutes });
      }
      return next;
    });
  };

  const handleImport = () => {
    const items = Array.from(selected.values()).map((s) => ({
      name: s.event.summary,
      duration: Math.max(1, s.durationMinutes) * 60,
    }));
    onImport(items);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.headerTitle}>Import from Google Calendar</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          {loading && <div className={styles.loading}>Loading today&apos;s events...</div>}
          {error && <div className={styles.error}>{error}</div>}
          {!loading && !error && events.length === 0 && (
            <div className={styles.empty}>No events found for today.</div>
          )}
          {!loading && !error && events.length > 0 && (
            <div className={styles.eventList}>
              {events.map((event) => {
                const isSelected = selected.has(event.id);
                const entry = selected.get(event.id);
                return (
                  <div key={event.id} className={styles.event} onClick={() => toggleEvent(event)}>
                    <div className={clsx(styles.checkbox, isSelected && styles.checkboxChecked)}>
                      {isSelected && <Check size={12} strokeWidth={3} color="#0f172a" />}
                    </div>
                    <div className={styles.eventInfo}>
                      <div className={styles.eventName}>{event.summary}</div>
                      <div className={styles.eventTime}>
                        {formatEventTime(event.start)}
                        {event.end ? ` - ${formatEventTime(event.end)}` : ''}
                      </div>
                    </div>
                    {isSelected && (
                      <>
                        <input
                          className={styles.durationInput}
                          type="number"
                          min={1}
                          max={999}
                          value={entry?.durationMinutes ?? 25}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setDuration(event.id, parseInt(e.target.value) || 1)}
                        />
                        <span className={styles.durationLabel}>min</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.importBtn}
            disabled={selected.size === 0}
            onClick={handleImport}
          >
            Import {selected.size > 0 ? `(${selected.size})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
