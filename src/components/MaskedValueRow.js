import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { maskIdentifier } from '../utils/format';

export default function MaskedValueRow({ label, value }) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{visible ? value || '-' : maskIdentifier(value)}</Text>
      </View>
      <Pressable onPress={() => setVisible((prev) => !prev)}>
        <Text style={styles.action}>{visible ? 'Hide' : 'Reveal'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  label: { color: colors.muted, fontWeight: '700', marginBottom: 4 },
  value: { color: colors.text, fontWeight: '700' },
  action: { color: colors.primary, fontWeight: '800' }
});
