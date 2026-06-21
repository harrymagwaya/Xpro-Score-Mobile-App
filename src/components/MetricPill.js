import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function MetricPill({ label, value, tone = 'default' }) {
  const toneColor = tones[tone] || tones.default;
  return (
    <View style={[styles.card, { borderColor: toneColor, backgroundColor: '#fff' }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: toneColor }]}>{value}</Text>
    </View>
  );
}

const tones = {
  default: colors.text,
  primary: colors.primary,
  success: colors.success,
  warning: colors.warning
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 100,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16
  },
  label: {
    color: colors.muted,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase'
  },
  value: {
    marginTop: 12,
    fontWeight: '800',
    fontSize: 24
  }
});
