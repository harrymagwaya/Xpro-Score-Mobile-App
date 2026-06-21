import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Card from './Card';
import { colors } from '../theme/colors';

export default function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <View style={styles.wrap}>
        <Text style={styles.title}>Something needs attention</Text>
        <Text style={styles.message}>{message}</Text>
        {onRetry ? (
          <Pressable style={styles.button} onPress={onRetry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  message: { color: colors.muted, lineHeight: 20 },
  button: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14
  },
  buttonText: { color: '#fff', fontWeight: '800' }
});
