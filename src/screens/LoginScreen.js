import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import Screen from '../components/Screen';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import { colors } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { show } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!form.email || !form.password) {
      show('Enter your email and password to continue.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      await login(form);
      show('Welcome back.', 'success');
    } catch (error) {
      show(error.message || 'Unable to sign in to the tenant app.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll={false}>
      <LinearGradient colors={[colors.ink, colors.primaryDeep]} style={styles.hero}>
        <Text style={styles.eyebrow}>Mob Rental</Text>
        <Text style={styles.title}>Tenant mobile access built for daily rental life.</Text>
        <Text style={styles.subtitle}>Secure sign-in for payments, eligibility, score tracking, and your unit profile.</Text>
      </LinearGradient>

      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>User Login</Text>
        <Text style={styles.formText}>This mobile build is dedicated to tenant accounts only.</Text>

        <TextInput
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email address"
          placeholderTextColor={colors.muted}
          value={form.email}
          onChangeText={(email) => setForm((prev) => ({ ...prev, email }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          secureTextEntry
          value={form.password}
          onChangeText={(password) => setForm((prev) => ({ ...prev, password }))}
        />

        <Pressable style={[styles.button, submitting && styles.buttonMuted]} onPress={onSubmit} disabled={submitting}>
          <Text style={styles.buttonText}>{submitting ? 'Signing in...' : 'Sign In'}</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Need an account? Register as a tenant</Text>
        </Pressable>

        <Text style={styles.caption}>Offline protection, deep links, and mobile-safe tenant routing are already wired into this build.</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 28,
    padding: 24,
    gap: 10,
    marginTop: 8
  },
  eyebrow: {
    color: '#93C5FD',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34
  },
  subtitle: {
    color: '#DCE8FF',
    fontSize: 15,
    lineHeight: 22
  },
  formCard: {
    marginTop: 10,
    gap: 14
  },
  formTitle: { fontSize: 24, fontWeight: '900', color: colors.text },
  formText: { color: colors.muted, lineHeight: 20 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    backgroundColor: '#FBFDFF'
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center'
  },
  buttonMuted: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  link: { textAlign: 'center', color: colors.primary, fontWeight: '800' },
  caption: { color: colors.muted, fontSize: 12, lineHeight: 18 }
});
