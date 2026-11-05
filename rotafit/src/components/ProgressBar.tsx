import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useTheme } from '@/theme';

interface ProgressBarProps {
  progress: number; // 0 a 100
  label?: string;
  detail?: string;
  completed?: boolean;
}

export function ProgressBar({
  progress,
  label,
  detail,
  completed = false,
}: ProgressBarProps) {
  const { theme } = useTheme();
  const clamped = Math.min(Math.max(0, progress), 100);
  const barColor = completed ? theme.success : theme.primary;

  return (
    <View style={styles.container}>
      {(label || detail) && (
        <View style={styles.header}>
          {label ? (
            <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
          ) : null}
          {detail ? (
            <Text
              style={[styles.detail, { color: completed ? theme.success : theme.muted }]}
            >
              {detail}
            </Text>
          ) : null}
        </View>
      )}
      <View
        style={[
          styles.track,
          {
            backgroundColor:
              theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            borderColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${clamped}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  detail: {
    fontSize: 12,
    fontWeight: '600',
  },
  track: {
    height: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
