import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import Screen from '../components/Screen';
import Card from '../components/Card';
import SectionHeading from '../components/SectionHeading';
import MetricPill from '../components/MetricPill';
import ScreenLoader from '../components/ScreenLoader';
import ErrorState from '../components/ErrorState';
import useAuth from '../hooks/useAuth';
import useUserProfile from '../hooks/useUserProfile';
import { useEligibility } from '../hooks/useEligibility';
import { useTenantFinancialHistory } from '../hooks/useFinancial';
import { useUnitByTenant } from '../hooks/usePropertyUnits';
import { useLatestScore } from '../hooks/useScoring';
import { useRentalProfilesByTenant } from '../hooks/useRentalProfile';
import { useTenantCapacity } from '../hooks/useTenantCapacities';
import { colors } from '../theme/colors';
import { extractList, firstDefined, formatCurrency, formatDate } from '../utils/format';

export default function HomeScreen() {
  const { userId } = useAuth();
  const profileResource = useUserProfile();
  const scoreResource = useLatestScore(userId);
  const eligibilityResource = useEligibility(userId);
  const historyResource = useTenantFinancialHistory(userId);
  const unitResource = useUnitByTenant(userId);
  const rentalProfileResource = useRentalProfilesByTenant(userId);
  const capacityResource = useTenantCapacity(userId);

  const loading = [
    profileResource.loading,
    scoreResource.loading,
    eligibilityResource.loading,
    historyResource.loading,
    unitResource.loading,
    rentalProfileResource.loading,
    capacityResource.loading
  ].some(Boolean);

  const error =
    profileResource.error ||
    scoreResource.error ||
    eligibilityResource.error ||
    historyResource.error ||
    unitResource.error ||
    rentalProfileResource.error ||
    capacityResource.error ||
    null;

  const reload = async () => {
    await Promise.all([
      profileResource.reload(),
      scoreResource.reload(),
      eligibilityResource.reload(),
      historyResource.reload(),
      unitResource.reload(),
      rentalProfileResource.reload(),
      capacityResource.reload()
    ]);
  };

  if (loading && !profileResource.data) return <ScreenLoader label="Loading your tenant dashboard..." />;
  if (error && !profileResource.data) return <Screen><ErrorState message={error.message} onRetry={reload} /></Screen>;

  const profile = profileResource.data || {};
  const score = scoreResource.data || {};
  const eligibility = eligibilityResource.data || {};
  const records = extractList(historyResource.data);
  const unit = unitResource.data || {};
  const rentalProfiles = extractList(rentalProfileResource.data);
  const latestScore = firstDefined(score.creditScore, score.score, score.finalScore, 0);
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
  const capacityValue = firstDefined(
    capacityResource.data?.capacityScore,
    capacityResource.data?.score,
    capacityResource.data?.tenantCapacity,
    capacityResource.data?.financialCapacity,
    capacityResource.data?.capacity,
    '-'
  );
  const firstName = firstDefined(profile.firstName, profile.username, 'Tenant');
  const eligible = eligibility.isCalculationAllowed ?? eligibility.calculationAllowed;
  const onTimeCount = records.filter((record) => String(record.status || '').toUpperCase() === 'ON_TIME').length;
  const totalValue = records.reduce((sum, record) => sum + Number(record.amount || 0), 0);

  return (
    <Screen refreshing={loading} onRefresh={reload}>
      <LinearGradient colors={[colors.ink, colors.primaryDeep]} style={styles.hero}>
        <Text style={styles.heroEyebrow}>Welcome back</Text>
        <Text style={styles.heroName}>{firstName}</Text>
        <Text style={styles.heroScore}>{latestScore}</Text>
        <Text style={styles.heroSubtitle}>{firstDefined(eligibility.statusMessage, eligibility.riskBand, 'Keep building your rental profile.')}</Text>
      </LinearGradient>

      <SectionHeading title="Eligibility & Limits" />
      <View style={styles.grid}>
        <MetricPill label="Minimum limit" value={formatCurrency(minLimit)} tone="primary" />
        <MetricPill label="Maximum limit" value={formatCurrency(maxLimit)} tone="success" />
      </View>

      <View style={styles.grid}>
        <MetricPill label="Borrow capacity" value={String(capacityValue)} tone="warning" />
        <MetricPill label="On-time records" value={String(onTimeCount)} tone="success" />
      </View>

      <SectionHeading title="Activity Snapshot" />
      <Card>
        <Row label="Eligibility status" value={eligible ? 'Calculation allowed' : 'Needs review'} />
        <Row label="Risk band" value={firstDefined(eligibility.riskBand, '-')} />
        <Row label="Monthly income" value={formatCurrency(eligibility.monthlyIncome)} />
        <Row label="Economic footprint" value={formatCurrency(eligibility.totalEconomicFootprint)} />
        <Row label="Recorded value" value={formatCurrency(totalValue)} />
      </Card>

      <SectionHeading title="Tenancy" />
      <Card>
        <Row label="Property" value={firstDefined(unit.propertyName, unit.property?.name, 'Awaiting assignment')} />
        <Row label="Unit" value={firstDefined(unit.unitName, unit.unitNumber, 'No unit assigned')} />
        <Row label="Lease status" value={firstDefined(rentalProfiles[0]?.status, 'Unknown')} />
        <Row label="Updated" value={formatDate(eligibility.updatedAt)} />
      </Card>
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
  hero: { borderRadius: 28, padding: 24, gap: 8 },
  heroEyebrow: { color: '#9FC4FF', fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  heroName: { color: '#fff', fontWeight: '900', fontSize: 28 },
  heroScore: { color: '#fff', fontWeight: '900', fontSize: 48 },
  heroSubtitle: { color: '#DCE8FF', lineHeight: 20 },
  grid: { flexDirection: 'row', gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, gap: 12 },
  rowLabel: { color: colors.muted, fontWeight: '700', flex: 1 },
  rowValue: { color: colors.text, fontWeight: '800', flex: 1, textAlign: 'right' }
});
