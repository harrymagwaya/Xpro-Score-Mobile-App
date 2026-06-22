import React, { useMemo, useState, useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";

import Screen from "../components/Screen";
import Card from "../components/Card";
import SectionHeading from "../components/SectionHeading";
import ScreenLoader from "../components/ScreenLoader";
import ErrorState from "../components/ErrorState";
import useAuth from "../hooks/useAuth";
import {
  useFinancialRecordActions,
  useTenantFinancialHistory,
} from "../hooks/useFinancial";
import { useToast } from "../components/ToastProvider";
import { colors } from "../theme/colors";
import { extractList, formatCurrency, formatDate } from "../utils/format";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const categories = [
  "ALL",
  "RENT",
  "UTILITY",
  "AIRTIME",
  "SAVINGS",
  "LOAN",
  "MOBILE_MONEY",
];

const initialForm = {
  txnId: "",
  category: "RENT",
  amount: "",
  transactionDate: "",
  referenceNote: "",
};

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function PaymentsScreen() {
  const { userId } = useAuth();
  const { show } = useToast();
  const historyResource = useTenantFinancialHistory(userId);
  const { createFinancialRecord } = useFinancialRecordActions();

  const [category, setCategory] = useState("ALL");
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => getInitialPickerDate());

  // Animation for modal slide-up
  const slideAnim = useState(new Animated.Value(SCREEN_HEIGHT))[0];

  const records = extractList(historyResource.data);
  const filtered = useMemo(() => {
    if (category === "ALL") return records;
    return records.filter(
      (record) => String(record.category || "").toUpperCase() === category,
    );
  }, [category, records]);

  const openModal = useCallback(() => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [slideAnim]);

  const closeModal = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: Platform.OS !== "web",
    }).start(() => {
      setModalVisible(false);
      setForm(initialForm);
      setSubmitting(false);
    });
  }, [slideAnim]);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openDatePicker = useCallback(() => {
    setPickerDate(parsePickerDate(form.transactionDate));
    setDatePickerVisible(true);
  }, [form.transactionDate]);

  const closeDatePicker = useCallback(() => {
    setDatePickerVisible(false);
  }, []);

  const confirmDatePicker = useCallback(() => {
    updateForm("transactionDate", formatPickerDate(pickerDate));
    setDatePickerVisible(false);
  }, [pickerDate]);

  const days = getDaysInMonth(pickerDate.year, pickerDate.month);
  const years = getYearOptions();

  const submitRecord = async () => {
    if (!form.txnId || !form.amount) {
      show("Transaction ID and amount are required.", "warning");
      return;
    }
    try {
      setSubmitting(true);
      await createFinancialRecord({
        ...form,
        tenantId: userId,
        amount: Number(form.amount),
        transactionDate: form.transactionDate
          ? `${formatPickerDate(parsePickerDate(form.transactionDate))}T00:00:00`
          : "",
      });
      show("Payment record submitted for verification.", "success");
      setForm(initialForm);
      await historyResource.reload();
      closeModal();
    } catch (submitError) {
      show(
        submitError.message || "Unable to submit the payment record.",
        "error",
      );
      setSubmitting(false);
    }
  };

  if (historyResource.loading && !historyResource.data) {
    return <ScreenLoader label="Loading your financial records..." />;
  }

  if (historyResource.error && !historyResource.data) {
    return (
      <Screen>
        <ErrorState
          message={historyResource.error.message}
          onRetry={historyResource.reload}
        />
      </Screen>
    );
  }

  return (
    <Screen
      refreshing={historyResource.loading}
      onRefresh={historyResource.reload}
    >
      {/* Header with Add Button */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Financial Records</Text>
          <Text style={styles.headerSubtitle}>
            Add activity that contributes to your credit profile
          </Text>
        </View>
        <Pressable style={styles.addButton} onPress={openModal}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {categories.map((item) => (
          <Pressable
            key={item}
            style={[styles.chip, category === item && styles.chipActive]}
            onPress={() => setCategory(item)}
          >
            <Text
              style={[
                styles.chipText,
                category === item && styles.chipTextActive,
              ]}
            >
              {item.replace("_", " ")}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* History List */}
      <SectionHeading title="Credit Activity History" />
      {filtered.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No records found for this category.
          </Text>
          <Text style={styles.emptyHint}>
            Tap the + button to file your first record.
          </Text>
        </Card>
      ) : (
        <View style={styles.list}>
          {filtered.map((record, index) => (
            <Card
              key={record.id || record.recordId || `${record.txnId}-${index}`}
              style={styles.recordCard}
            >
              <View style={styles.recordHeader}>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: getCategoryColor(record.category) },
                  ]}
                />
                <Text style={styles.categoryLabel}>
                  {String(record.category || "RENT").replace("_", " ")}
                </Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {record.status || "PENDING"}
                  </Text>
                </View>
              </View>

              <Text style={styles.amount}>{formatCurrency(record.amount)}</Text>

              <View style={styles.recordMeta}>
                <Text style={styles.metaText}>
                  {record.recordType || record.channel || "Manual"}
                </Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>
                  {formatDate(record.transactionDate)}
                </Text>
              </View>

              <View style={styles.divider} />

              <Row label="Transaction ID" value={record.txnId || "-"} />
              <Row label="Reference" value={record.referenceNote || "-"} />
            </Card>
          ))}
        </View>
      )}

      {/* Bottom Sheet Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.modalSheet,
                  { transform: [{ translateY: slideAnim }] },
                ]}
              >
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : undefined}
                  style={styles.keyboardView}
                >
                  <View style={styles.dragHandle} />

                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.modalContent}
                  >
                    <Text style={styles.modalTitle}>File a Record</Text>
                    <Text style={styles.modalSubtitle}>
                      Submit rent, utilities, airtime, savings, or mobile money
                      proofs for verification.
                    </Text>

                    <Text style={styles.label}>Transaction ID</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., TXN123456789"
                      placeholderTextColor={colors.muted}
                      value={form.txnId}
                      onChangeText={(v) => updateForm("txnId", v)}
                    />

                    <Text style={styles.label}>Category</Text>
                    <View style={styles.categoryRow}>
                      {[
                        "RENT",
                        "UTILITY",
                        "AIRTIME",
                        "SAVINGS",
                        "LOAN",
                        "MOBILE_MONEY",
                      ].map((cat) => (
                        <Pressable
                          key={cat}
                          style={[
                            styles.categoryChip,
                            form.category === cat && styles.categoryChipActive,
                          ]}
                          onPress={() => updateForm("category", cat)}
                        >
                          <Text
                            style={[
                              styles.categoryChipText,
                              form.category === cat &&
                                styles.categoryChipTextActive,
                            ]}
                          >
                            {cat.replace("_", " ")}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <Text style={styles.label}>Amount (UGX)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0.00"
                      placeholderTextColor={colors.muted}
                      keyboardType="numeric"
                      value={form.amount}
                      onChangeText={(v) => updateForm("amount", v)}
                    />

                    <Text style={styles.label}>Transaction Date</Text>
                    <Pressable
                      style={[styles.input, styles.dateField]}
                      onPress={openDatePicker}
                    >
                      <Text
                        style={[
                          styles.dateFieldText,
                          !form.transactionDate && styles.dateFieldPlaceholder,
                        ]}
                      >
                        {form.transactionDate
                          ? formatDisplayDate(form.transactionDate)
                          : "Pick a date"}
                      </Text>
                    </Pressable>

                    <Text style={styles.label}>Reference Note</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Optional details about this payment..."
                      placeholderTextColor={colors.muted}
                      multiline
                      numberOfLines={3}
                      value={form.referenceNote}
                      onChangeText={(v) => updateForm("referenceNote", v)}
                    />

                    <View style={styles.modalActions}>
                      <Pressable
                        style={styles.cancelButton}
                        onPress={closeModal}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.submitButton,
                          submitting && styles.submitButtonDisabled,
                        ]}
                        onPress={submitRecord}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <Text style={styles.submitButtonText}>
                            Submitting...
                          </Text>
                        ) : (
                          <Text style={styles.submitButtonText}>
                            Submit Record
                          </Text>
                        )}
                      </Pressable>
                    </View>
                  </ScrollView>
                </KeyboardAvoidingView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={datePickerVisible}
        onRequestClose={closeDatePicker}
      >
        <TouchableWithoutFeedback onPress={closeDatePicker}>
          <View style={styles.pickerBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.pickerCard}>
                <Text style={styles.pickerTitle}>Choose Transaction Date</Text>

                <Text style={styles.pickerSectionLabel}>Month</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pickerRow}
                >
                  {months.map((month, index) => (
                    <Pressable
                      key={month}
                      style={[
                        styles.pickerChip,
                        pickerDate.month === index + 1 && styles.pickerChipActive,
                      ]}
                      onPress={() =>
                        setPickerDate((prev) => ({
                          ...prev,
                          month: index + 1,
                          day: Math.min(prev.day, getDaysInMonth(prev.year, index + 1)),
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.pickerChipText,
                          pickerDate.month === index + 1 && styles.pickerChipTextActive,
                        ]}
                      >
                        {month}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <Text style={styles.pickerSectionLabel}>Day</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pickerRow}
                >
                  {days.map((day) => (
                    <Pressable
                      key={day}
                      style={[
                        styles.pickerChip,
                        pickerDate.day === day && styles.pickerChipActive,
                      ]}
                      onPress={() => setPickerDate((prev) => ({ ...prev, day }))}
                    >
                      <Text
                        style={[
                          styles.pickerChipText,
                          pickerDate.day === day && styles.pickerChipTextActive,
                        ]}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <Text style={styles.pickerSectionLabel}>Year</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pickerRow}
                >
                  {years.map((year) => (
                    <Pressable
                      key={year}
                      style={[
                        styles.pickerChip,
                        pickerDate.year === year && styles.pickerChipActive,
                      ]}
                      onPress={() =>
                        setPickerDate((prev) => ({
                          ...prev,
                          year,
                          day: Math.min(prev.day, getDaysInMonth(year, prev.month)),
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.pickerChipText,
                          pickerDate.year === year && styles.pickerChipTextActive,
                        ]}
                      >
                        {year}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <View style={styles.pickerActions}>
                  <Pressable style={styles.cancelButton} onPress={closeDatePicker}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable style={styles.submitButton} onPress={confirmDatePicker}>
                    <Text style={styles.submitButtonText}>Use Date</Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Screen>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function getCategoryColor(category) {
  const map = {
    RENT: "#2563eb",
    UTILITY: "#16a34a",
    AIRTIME: "#f59e0b",
    SAVINGS: "#9333ea",
    LOAN: "#ef4444",
    MOBILE_MONEY: "#0f172a",
  };
  return map[String(category).toUpperCase()] || "#64748b";
}

function getInitialPickerDate() {
  const today = new Date();
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };
}

function parsePickerDate(value) {
  if (!value) return getInitialPickerDate();
  const normalized = String(value).split("T")[0];
  const [year, month, day] = normalized.split("-").map(Number);
  if (!year || !month || !day) return getInitialPickerDate();
  return { year, month, day };
}

function formatPickerDate({ year, month, day }) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDisplayDate(value) {
  const { year, month, day } = parsePickerDate(value);
  return `${day} ${months[month - 1]} ${year}`;
}

function getDaysInMonth(year, month) {
  return Array.from(
    { length: new Date(year, month, 0).getDate() },
    (_, index) => index + 1,
  );
}

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, index) => currentYear - index);
}

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 32,
  },

  // Chips
  chipsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 13,
  },
  chipTextActive: {
    color: "#fff",
  },

  // List
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  recordCard: {
    padding: 16,
  },
  recordHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#92400e",
  },
  amount: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.5,
  },
  recordMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 13,
    color: colors.muted,
  },
  metaDot: {
    fontSize: 13,
    color: colors.muted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    gap: 12,
  },
  rowLabel: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: "600",
  },
  rowValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "right",
  },

  // Empty State
  emptyCard: {
    alignItems: "center",
    paddingVertical: 40,
    marginHorizontal: 16,
  },
  emptyText: {
    color: colors.muted,
    fontWeight: "600",
    fontSize: 15,
  },
  emptyHint: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
    opacity: 0.7,
  },

  // Modal / Bottom Sheet
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.88,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  keyboardView: {
    maxHeight: SCREEN_HEIGHT * 0.88,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  modalContent: {
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: "#f8fafc",
  },
  dateField: {
    justifyContent: "center",
  },
  dateFieldText: {
    color: colors.text,
    fontSize: 16,
  },
  dateFieldPlaceholder: {
    color: colors.muted,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f8fafc",
  },
  categoryChipActive: {
    borderColor: colors.primary,
    backgroundColor: "#eff6ff",
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted,
  },
  categoryChipTextActive: {
    color: colors.primary,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  cancelButtonText: {
    fontWeight: "800",
    color: colors.text,
    fontSize: 15,
  },
  submitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    padding: 20,
  },
  pickerCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
  },
  pickerSectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.muted,
  },
  pickerRow: {
    gap: 8,
    paddingVertical: 2,
  },
  pickerChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#EEF3F8",
  },
  pickerChipActive: {
    backgroundColor: colors.primary,
  },
  pickerChipText: {
    color: colors.text,
    fontWeight: "700",
  },
  pickerChipTextActive: {
    color: "#fff",
  },
  pickerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  submitButtonText: {
    fontWeight: "900",
    color: "#fff",
    fontSize: 15,
  },
});
