import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import Screen from '../components/Screen';
import Card from '../components/Card';
import { useToast } from '../components/ToastProvider';
import { registerTenant } from '../api/auth';
import { colors } from '../theme/colors';

const initialForm = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  phoneNumber: '',
  gender: ''
};

export default function RegisterScreen({ navigation }) {
  const { show } = useToast();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    if (!form.firstName || !form.lastName || !form.username || !form.email || !form.password || !form.phoneNumber) {
      show('Fill in the required registration details first.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      await registerTenant(form);
      show('Tenant account created. You can now sign in.', 'success');
      navigation.replace('Login');
    } catch (error) {
      show(error.message || 'Unable to create your tenant account.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.ink, colors.teal]} style={styles.hero}>
          <Text style={styles.eyebrow}>Create your tenant account</Text>
          <Text style={styles.title}>Join Mob Rental directly from mobile.</Text>
          <Text style={styles.subtitle}>This flow creates a public tenant account and kicks off your baseline eligibility and credit setup.</Text>
        </LinearGradient>

        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>Tenant Registration</Text>
          <Text style={styles.formText}>Use your own details here. The app will register you specifically as a tenant account.</Text>

          {[
            ['firstName', 'First name'],
            ['lastName', 'Last name'],
            ['username', 'Username'],
            ['email', 'Email address'],
            ['password', 'Password'],
            ['phoneNumber', 'Phone number'],
            ['gender', 'Gender (optional)']
          ].map(([key, label]) => (
            <TextInput
              key={key}
              style={styles.input}
              autoCapitalize={key === 'email' ? 'none' : 'words'}
              keyboardType={key === 'email' ? 'email-address' : 'default'}
              secureTextEntry={key === 'password'}
              placeholder={label}
              placeholderTextColor={colors.muted}
              value={form[key]}
              onChangeText={(value) => update(key, value)}
            />
          ))}

          <Pressable style={[styles.button, submitting && styles.buttonMuted]} onPress={submit} disabled={submitting}>
            <Text style={styles.buttonText}>{submitting ? 'Creating account...' : 'Create Tenant Account'}</Text>
          </Pressable>

          <Pressable onPress={() => navigation.replace('Login')}>
            <Text style={styles.link}>Already have a tenant account? Sign in</Text>
          </Pressable>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 48, gap: 16 },
  hero: { borderRadius: 28, padding: 24, gap: 10, marginTop: 8 },
  eyebrow: { color: '#B6FFF2', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', lineHeight: 34 },
  subtitle: { color: '#E7FFFB', fontSize: 15, lineHeight: 22 },
  formCard: { gap: 14 },
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
  link: { textAlign: 'center', color: colors.primary, fontWeight: '800' }
});
