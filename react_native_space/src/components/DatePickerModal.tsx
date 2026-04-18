import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../theme';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  initialDate?: string;
  title?: string;
}

export function DatePickerModal({ visible, onClose, onSelect, initialDate, title = 'Selecionar Data' }: Props) {
  const parsed = initialDate ? new Date(initialDate + 'T00:00:00') : new Date();
  const [year, setYear] = useState(isNaN(parsed.getTime()) ? new Date().getFullYear() : parsed.getFullYear());
  const [month, setMonth] = useState(isNaN(parsed.getTime()) ? new Date().getMonth() : parsed.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(
    initialDate && !isNaN(parsed.getTime()) ? parsed.getDate() : null,
  );

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const blanks: (number | null)[] = Array(firstDay).fill(null);
    const dayNumbers: (number | null)[] = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return [...blanks, ...dayNumbers];
  }, [year, month]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else { setMonth(m => m - 1); }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else { setMonth(m => m + 1); }
    setSelectedDay(null);
  };

  const handleConfirm = () => {
    if (selectedDay == null) return;
    const m = String(month + 1).padStart(2, '0');
    const d = String(selectedDay).padStart(2, '0');
    onSelect(`${year}-${m}-${d}`);
    onClose();
  };

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <Text style={styles.title}>{title}</Text>

          {/* Month/Year Nav */}
          <View style={styles.nav}>
            <Pressable onPress={prevMonth} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.navTitle}>{MONTHS[month]} {year}</Text>
            <Pressable onPress={nextMonth} style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={22} color={colors.textPrimary} />
            </Pressable>
          </View>

          {/* Weekday headers */}
          <View style={styles.weekRow}>
            {WEEKDAYS.map((wd) => (
              <Text key={wd} style={styles.weekday}>{wd}</Text>
            ))}
          </View>

          {/* Day grid */}
          <View style={styles.grid}>
            {days.map((day, i) => (
              <Pressable
                key={i}
                style={[
                  styles.dayCell,
                  day === selectedDay && styles.daySelected,
                  day != null && isToday(day) && day !== selectedDay && styles.dayToday,
                ]}
                onPress={() => day != null && setSelectedDay(day)}
                disabled={day == null}
              >
                {day != null ? (
                  <Text
                    style={[
                      styles.dayText,
                      day === selectedDay && styles.dayTextSelected,
                      isToday(day) && day !== selectedDay && styles.dayTextToday,
                    ]}
                  >
                    {day}
                  </Text>
                ) : null}
              </Pressable>
            ))}
          </View>

          {/* Selected date preview */}
          {selectedDay != null ? (
            <Text style={styles.preview}>
              {String(selectedDay).padStart(2, '0')}/{String(month + 1).padStart(2, '0')}/{year}
            </Text>
          ) : null}

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmBtn, selectedDay == null && styles.confirmDisabled]}
              onPress={handleConfirm}
              disabled={selectedDay == null}
            >
              <Ionicons name="checkmark" size={18} color="#FFF" />
              <Text style={styles.confirmText}>Confirmar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 360,
    ...shadows,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  navBtn: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xs,
  },
  weekday: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    maxHeight: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: CELL_SIZE / 2,
    marginVertical: 2,
  },
  daySelected: {
    backgroundColor: colors.primary,
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  dayTextSelected: {
    color: '#FFF',
    fontWeight: '700',
  },
  dayTextToday: {
    color: colors.primary,
    fontWeight: '600',
  },
  preview: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  confirmDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});
