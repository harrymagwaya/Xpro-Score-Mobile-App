import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import Screen from '../components/Screen';
import Card from '../components/Card';
import SectionHeading from '../components/SectionHeading';
import ScreenLoader from '../components/ScreenLoader';
import ErrorState from '../components/ErrorState';
import useAuth from '../hooks/useAuth';
import { useFinancialRecordActions, useTenantFinancialHistory } from '../hooks/useFinancial';
import { useToast } from '../components/ToastProvider';
import { colors } from '../theme/colors';
import { extractList, formatCurrency, formatDate } from '../utils/format';

const categories = ['ALL', 'RENT', 'UTILITY', 'AIRTIME', 'SAVINGS', 'LOAN', 'MOBILE_MONEY'];

export default function PaymentsScreen() {
  const { userId } = useAuth();
  const { show } = useToast();
  const historyResource = useTenantFinancialHistory(userId);
  const { createFinancialRecord } = useFinancialRecordActions();
  const [category, setCategory] = useState('ALL');
  const [form, setForm] = useState({ txnId: '', category: 'RENT', amount: '', transactionDate: '', referenceNote: '' });
  const [submitting, setSubmitting] = useState(false);

  const records = extractList(historyResource.data);
  const filtered = useMemo(() => {
    if (category === 'ALL') return records;
    return records.filter((record) => String(record.category || '').toUpperCase() === category);
  }, [category, records]);

  if (historyResource.loading && !historyResource.data) return <ScreenLoader label="Loading your payment history..." />;
  if (historyResource.error && !historyResource.data) {
    return <Screen><ErrorState message={historyResource.error.message} onRetry={historyResource.reload} /></Screen>;
  }

  const submitRecord = async () => {
    if (!form.txnId || !form.amount) {
      show('Transaction ID and amount are required.', 'warning');
      return;
    }
    try {
      setSubmitting(true);
      await createFinancialRecord({ ...form, tenantId: userId, amount: Number(form.amount) });
      show('Payment record submitted for verification.', 'success');
      setForm({ txnId: '', category: 'RENT', amount: '', transactionDate: '', referenceNote: '' });
      await historyResource.reload();
    } catch (submitError) {
      show(submitError.message || 'Unable to submit the payment record.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen refreshing={historyResource.loading} onRefresh={historyResource.reload}>
      <SectionHeading title="Payment Actions" />
      <Card>
        <Text style={styles.title}>File a tenant payment record</Text>
        <Text style={styles.caption}>Use this for rent, utilities, airtime, savings, loan, or mobile money proofs.</Text>
        <TextInput style={styles.input} placeholder="Transaction ID" value={form.txnId} onChangeText={(txnId) => setForm((p) => ({ ...p, txnId }))} />
        <TextInput style={styles.input} placeholder="Category" value={form.category} onChangeText={(next) => setForm((p) => ({ ...p, category: next.toUpperCase() }))} />
        <TextInput style={styles.input} placeholder="Amount" keyboardType="numeric" value={form.amount} onChangeText={(amount) => setForm((p) => ({ ...p, amount }))} />
        <TextInput style={styles.input} placeholder="Transaction Date (YYYY-MM-DD)" value={form.transactionDate} onChangeText={(transactionDate) => setForm((p) => ({ ...p, transactionDate }))} />
        <TextInput style={[styles.input, styles.textArea]} placeholder="Reference Note" multiline value={form.referenceNote} onChangeText={(referenceNote) => setForm((p) => ({ ...p, referenceNote }))} />
        <Pressable style={styles.button} onPress={submitRecord} disabled={submitting}>
          <Text style={styles.buttonText}>{submitting ? 'Submitting...' : 'Submit Record'}</Text>
        </Pressable>
      </Card>

      <SectionHeading title="History Filter" />
      <View style={styles.chips}>
        {categories.map((item) => (
          <Pressable key={item} style={[styles.chip, category === item && styles.chipActive]} onPress={() => setCategory(item)}>
            <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item.replace('_', ' ')}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeading title="Payment Ledger" />
      {filtered.length === 0 ? (
        <Card><Text style={styles.caption}>No records available for this category yet.</Text></Card>
      ) : (
        filtered.map((record, index) => (
          <Card key={record.id || record.recordId || `${record.txnId}-${index}`}>
            <Text style={styles.amount}>{formatCurrency(record.amount)}</Text>
            <Text style={styles.meta}>{String(record.category || 'RENT').replace('_', ' ')} • {record.recordType || record.channel || 'Manual'}</Text>
            <Row label="Status" value={record.status || 'PENDING'} />
            <Row label="Date" value={formatDate(record.transactionDate)} />
            <Row label="Reference" value={record.txnId || record.referenceNote || '-'} />
          </Card>
        ))
      )}
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
  title: { fontSize: 18, fontWeight: '900', color: colors.text },
  caption: { color: colors.muted, lineHeight: 20 },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, marginTop: 10 },
  textArea: { minHeight: 96, textAlignVertical: 'top' },
  button: { marginTop: 12, backgroundColor: colors.primary, borderRadius: 16, alignItems: 'center', paddingVertical: 14 },
  buttonText: { color: '#fff', fontWeight: '900' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { borderWidth: 1, borderColor: colors.line, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff' },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { color: colors.text, fontWeight: '700' },
  chipTextActive: { color: '#fff' },
  amount: { fontSize: 26, fontWeight: '900', color: colors.text },
  meta: { color: colors.muted, marginTop: 4, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 6, gap: 12 },
  rowLabel: { color: colors.muted, fontWeight: '700' },
  rowValue: { color: colors.text, fontWeight: '800' }
});
