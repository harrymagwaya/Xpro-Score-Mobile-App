import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';

import Screen from '../components/Screen';
import Card from '../components/Card';
import { usePasswordResetActions } from '../hooks/usePasswordReset';
import { useToast } from '../components/ToastProvider';
import { colors } from '../theme/colors';

export default function ResetPasswordScreen() {
  const { show } = useToast();
  const { requestPasswordReset } = usePasswordResetActions();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!email) {
      show('Enter your account email first.', 'warning');
      return;
    }
    try {
      setSubmitting(true);
      await requestPasswordReset(email);
      show('Password reset request submitted.', 'success');
    } catch (error) {
      show(error.message || 'Unable to start password reset.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.text}>This mobile flow is wired through a dedicated password reset hook and can be connected to OTP or email verification next.</Text>
        <TextInput style={styles.input} placeholder="Email address" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <Pressable style={styles.button} onPress={submit} disabled={submitting}>
          <Text style={styles.buttonText}>{submitting ? 'Submitting...' : 'Request Reset'}</Text>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '900', color: colors.text },
  text: { color: colors.muted, lineHeight: 20, marginTop: 8 },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, marginTop: 16 },
  button: { backgroundColor: colors.primary, borderRadius: 16, alignItems: 'center', paddingVertical: 14, marginTop: 14 },
  buttonText: { color: '#fff', fontWeight: '900' }
});
