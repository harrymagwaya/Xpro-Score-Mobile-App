import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import Screen from '../components/Screen';
import Card from '../components/Card';
import SectionHeading from '../components/SectionHeading';
import ScreenLoader from '../components/ScreenLoader';
import ErrorState from '../components/ErrorState';
import MaskedValueRow from '../components/MaskedValueRow';
import useAuth from '../hooks/useAuth';
import useUserProfile from '../hooks/useUserProfile';
import { useEligibility } from '../hooks/useEligibility';
import { useLatestScore } from '../hooks/useScoring';
import { useUserActions } from '../hooks/useUsers';
import { useToast } from '../components/ToastProvider';
import { colors } from '../theme/colors';
import { formatCurrency, firstDefined } from '../utils/format';

export default function ProfileScreen({ navigation }) {
  const { logout, userId } = useAuth();
  const { show } = useToast();
  const { updateUser } = useUserActions();
  const profileResource = useUserProfile();
  const eligibilityResource = useEligibility(userId);
  const scoreResource = useLatestScore(userId);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '' });

  const loading = [profileResource.loading, eligibilityResource.loading, scoreResource.loading].some(Boolean);
  const error = profileResource.error || eligibilityResource.error || scoreResource.error || null;

  const reload = async () => {
    await Promise.all([profileResource.reload(), eligibilityResource.reload(), scoreResource.reload()]);
  };

  useEffect(() => {
    const user = profileResource.data || {};
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneNumber: user.phoneNumber || ''
    });
  }, [profileResource.data]);

  if (loading && !profileResource.data) return <ScreenLoader label="Loading your profile..." />;
  if (error && !profileResource.data) return <Screen><ErrorState message={error.message} onRetry={reload} /></Screen>;

  const user = profileResource.data || {};
  const eligibility = eligibilityResource.data || {};
  const latestScore = firstDefined(scoreResource.data?.creditScore, scoreResource.data?.score, scoreResource.data?.finalScore, 0);
  const minLimit = firstDefined(
    eligibility.minEligibleLimit,
    eligibility.minimumLimit,
    eligibility.minLimit,
    eligibility.minimumEligibleAmount,
    eligibility.minimumAmount,
    '-'
  );
  const maxLimit = firstDefined(
    eligibility.maxEligibleLimit,
    eligibility.maximumLimit,
    eligibility.maxLimit,
    eligibility.maximumEligibleAmount,
    eligibility.maximumAmount,
    '-'
  );

  const saveProfile = async () => {
    try {
      setSaving(true);
      await updateUser(userId, form);
      show('Profile updated successfully.', 'success');
      setEditing(false);
      await reload();
    } catch (saveError) {
      show(saveError.message || 'Unable to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen refreshing={loading} onRefresh={reload}>
      <Card>
        <Text style={styles.name}>{firstDefined([user.firstName, user.lastName].filter(Boolean).join(' '), user.username, 'Tenant')}</Text>
        <Text style={styles.subtitle}>{firstDefined(user.email, 'No email registered')}</Text>
        <Text style={styles.credit}>Credit Score: {latestScore}</Text>
      </Card>

      <SectionHeading title="Profile Details" action={<Pressable onPress={() => setEditing((prev) => !prev)}><Text style={styles.link}>{editing ? 'Cancel' : 'Edit'}</Text></Pressable>} />
      <Card>
        {editing ? (
          <>
            <TextInput style={styles.input} placeholder="First name" value={form.firstName} onChangeText={(firstName) => setForm((p) => ({ ...p, firstName }))} />
            <TextInput style={styles.input} placeholder="Last name" value={form.lastName} onChangeText={(lastName) => setForm((p) => ({ ...p, lastName }))} />
            <TextInput style={styles.input} placeholder="Phone number" value={form.phoneNumber} onChangeText={(phoneNumber) => setForm((p) => ({ ...p, phoneNumber }))} />
            <Pressable style={styles.primaryButton} onPress={saveProfile} disabled={saving}>
              <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save Profile'}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Row label="First name" value={firstDefined(user.firstName, '-')} />
            <Row label="Last name" value={firstDefined(user.lastName, '-')} />
            <Row label="Phone" value={firstDefined(user.phoneNumber, '-')} />
          </>
        )}
      </Card>

      <SectionHeading title="Eligibility Summary" />
      <Card>
        <Row label="Risk band" value={firstDefined(eligibility.riskBand, '-')} />
        <Row label="Risk category" value={firstDefined(eligibility.riskCategory, '-')} />
        <Row label="Minimum limit" value={formatCurrency(minLimit)} />
        <Row label="Maximum limit" value={formatCurrency(maxLimit)} />
      </Card>

      <SectionHeading title="Profile Security" />
      <Card>
        <MaskedValueRow label="Tenant ID" value={eligibility.tenantId || user.id || user.userId} />
        <View style={styles.divider} />
        <Row label="Email" value={firstDefined(user.email, '-')} />
      </Card>

      <View style={styles.bottomActions}>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('ResetPassword')}>
          <Text style={styles.secondaryButtonText}>Reset Password</Text>
        </Pressable>
        <Pressable style={styles.dangerButton} onPress={logout}>
          <Text style={styles.dangerButtonText}>Sign Out</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 28, fontWeight: '900', color: colors.text },
  subtitle: { color: colors.muted, marginTop: 4 },
  credit: { color: colors.primary, marginTop: 10, fontWeight: '800' },
  link: { color: colors.primary, fontWeight: '800' },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10 },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 16, alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  primaryButtonText: { color: '#fff', fontWeight: '900' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, gap: 12 },
  rowLabel: { color: colors.muted, fontWeight: '700' },
  rowValue: { color: colors.text, fontWeight: '800' },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 14 },
  bottomActions: { gap: 10 },
  secondaryButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 18, alignItems: 'center', paddingVertical: 14 },
  secondaryButtonText: { color: colors.text, fontWeight: '900' },
  dangerButton: { backgroundColor: colors.danger, borderRadius: 18, alignItems: 'center', paddingVertical: 14 },
  dangerButtonText: { color: '#fff', fontWeight: '900' }
});
