import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Screen from '../components/Screen';
import Card from '../components/Card';
import SectionHeading from '../components/SectionHeading';
import ScreenLoader from '../components/ScreenLoader';
import ErrorState from '../components/ErrorState';
import MaskedValueRow from '../components/MaskedValueRow';
import useAuth from '../hooks/useAuth';
import { useUnitByTenant } from '../hooks/usePropertyUnits';
import { colors } from '../theme/colors';
import { firstDefined } from '../utils/format';

export default function UnitScreen() {
  const { userId } = useAuth();
  const unitResource = useUnitByTenant(userId);

  if (unitResource.loading && !unitResource.data) return <ScreenLoader label="Loading your unit assignment..." />;
  if (unitResource.error && !unitResource.data) return <Screen><ErrorState message={unitResource.error.message} onRetry={unitResource.reload} /></Screen>;

  const unit = unitResource.data || {};

  return (
    <Screen refreshing={unitResource.loading} onRefresh={unitResource.reload}>
      <Card>
        <Text style={styles.name}>{firstDefined(unit.unitName, unit.unitNumber, 'No unit assigned')}</Text>
        <Text style={styles.subtitle}>{firstDefined(unit.propertyName, unit.property?.name, 'Awaiting landlord assignment')}</Text>
      </Card>

      <SectionHeading title="Unit Details" />
      <Card>
        <Row label="Property" value={firstDefined(unit.propertyName, unit.property?.name, '-')} />
        <Row label="Unit" value={firstDefined(unit.unitName, unit.unitNumber, '-')} />
        <Row label="Status" value={firstDefined(unit.status, 'UNASSIGNED')} />
      </Card>

      <SectionHeading title="Sensitive Identifiers" />
      <Card>
        <MaskedValueRow label="Property ID" value={firstDefined(unit.propertyId, unit.property?.id, '')} />
        <View style={styles.divider} />
        <MaskedValueRow label="Unit ID" value={firstDefined(unit.id, unit.unitId, '')} />
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
  name: { fontSize: 28, fontWeight: '900', color: colors.text },
  subtitle: { color: colors.muted, marginTop: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, gap: 12 },
  rowLabel: { color: colors.muted, fontWeight: '700' },
  rowValue: { color: colors.text, fontWeight: '800' },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 14 }
});
