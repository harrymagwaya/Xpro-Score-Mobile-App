import React, { useEffect, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import Card from "../components/Card";
import ErrorState from "../components/ErrorState";
import Screen from "../components/Screen";
import ScreenLoader from "../components/ScreenLoader";
import useAuth from "../hooks/useAuth";
import { useEligibility } from "../hooks/useEligibility";
import { colors } from "../theme/colors";
import { firstDefined, formatCurrency, formatDate } from "../utils/format";

// Risk color helper
function getRiskMeta(band) {
  const map = {
    PLATINUM: { color: "#10b981", bg: "#ecfdf5", label: "Excellent" },
    GOLD: { color: "#f59e0b", bg: "#fffbeb", label: "Good" },
    SILVER: { color: "#64748b", bg: "#f8fafc", label: "Fair" },
    BRONZE: { color: "#d97706", bg: "#fef3c7", label: "Building" },
    LOW_RISK: { color: "#10b981", bg: "#ecfdf5", label: "Low Risk" },
    MEDIUM_RISK: { color: "#f59e0b", bg: "#fffbeb", label: "Medium Risk" },
    HIGH_RISK: { color: "#ef4444", bg: "#fef2f2", label: "High Risk" },
  };
  return map[band] || { color: "#94a3b8", bg: "#f1f5f9", label: "Unknown" };
}

export default function EligibilityScreen({ navigation }) {
  const { userId } = useAuth();
  const eligibilityResource = useEligibility(userId);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (eligibilityResource.loading && !eligibilityResource.data) {
    return <ScreenLoader label="Loading your credit eligibility..." />;
  }

  if (eligibilityResource.error && !eligibilityResource.data) {
    return (
      <Screen>
        <ErrorState
          message={eligibilityResource.error.message}
          onRetry={eligibilityResource.reload}
        />
      </Screen>
    );
  }

  const eligibility = eligibilityResource.data || {};
  const eligible =
    eligibility.isCalculationAllowed ?? eligibility.calculationAllowed;
  const minLimit = firstDefined(
    eligibility.minEligibleLimit,
    eligibility.minimumLimit,
    eligibility.minLimit,
    eligibility.minimumEligibleAmount,
    eligibility.minimumAmount,
    0,
  );
  const maxLimit = firstDefined(
    eligibility.maxEligibleLimit,
    eligibility.maximumLimit,
    eligibility.maxLimit,
    eligibility.maximumEligibleAmount,
    eligibility.maximumAmount,
    0,
  );

  const riskBand = eligibility.riskBand || "PENDING";
  const riskMeta = getRiskMeta(riskBand);
  const progress = eligible
    ? 85
    : Math.min(50, Math.max(15, (Number(minLimit) / 100000) * 100));

  return (
    <Screen
      refreshing={eligibilityResource.loading}
      onRefresh={eligibilityResource.reload}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <LinearGradient
            colors={["#0f172a", "#1e3a8a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View style={styles.headerTop}>
              <Text style={styles.headerEyebrow}>Eligibility Center</Text>
              <Pressable style={styles.infoButton} onPress={() => {}}>
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color="#93c5fd"
                />
              </Pressable>
            </View>

            {/* Score Ring */}
            <View style={styles.scoreSection}>
              <View style={styles.ringOuter}>
                <View
                  style={[
                    styles.ringInner,
                    { borderColor: eligible ? "#10b981" : "#f59e0b" },
                  ]}
                >
                  <Ionicons
                    name={eligible ? "shield-checkmark" : "hourglass"}
                    size={36}
                    color={eligible ? "#10b981" : "#f59e0b"}
                  />
                  <Text style={styles.ringStatus}>
                    {eligible ? "Eligible" : "Reviewing"}
                  </Text>
                </View>
              </View>
              <Text style={styles.headerCaption}>
                {firstDefined(
                  eligibility.statusMessage,
                  eligible
                    ? "You qualify for credit based on your financial behavior."
                    : "Keep adding verified records to unlock borrowing power.",
                )}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Progress Bar */}
        <Animated.View
          style={[
            styles.progressCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Profile Strength</Text>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: eligible ? "#10b981" : "#f59e0b",
                },
              ]}
            />
          </View>
          <Text style={styles.progressHint}>
            {eligible
              ? "Strong profile. You have active borrowing limits."
              : "Add more rent, utility, and mobile money records to improve."}
          </Text>
        </Animated.View>

        {/* Borrowing Limits */}
        <Text style={styles.sectionTitle}>Borrowing Power</Text>
        <Animated.View
          style={[
            styles.limitRow,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Card style={styles.limitCard}>
            <View style={[styles.limitIcon, { backgroundColor: "#eff6ff" }]}>
              <Ionicons name="arrow-down-outline" size={22} color="#2563eb" />
            </View>
            <Text style={styles.limitValue}>{formatCurrency(minLimit)}</Text>
            <Text style={styles.limitLabel}>Minimum</Text>
          </Card>
          <Card style={styles.limitCard}>
            <View style={[styles.limitIcon, { backgroundColor: "#f0fdf4" }]}>
              <Ionicons name="arrow-up-outline" size={22} color="#16a34a" />
            </View>
            <Text style={styles.limitValue}>{formatCurrency(maxLimit)}</Text>
            <Text style={styles.limitLabel}>Maximum</Text>
          </Card>
        </Animated.View>

        {/* Risk Assessment */}
        <Text style={styles.sectionTitle}>Risk Assessment</Text>
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <Card style={styles.riskCard}>
            <View style={styles.riskHeader}>
              <View
                style={[styles.riskBadge, { backgroundColor: riskMeta.bg }]}
              >
                <View
                  style={[styles.riskDot, { backgroundColor: riskMeta.color }]}
                />
                <Text style={[styles.riskBadgeText, { color: riskMeta.color }]}>
                  {riskMeta.label}
                </Text>
              </View>
              <Text style={styles.riskBand}>{riskBand}</Text>
            </View>

            <View style={styles.divider} />

            <DetailRow
              icon="layers-outline"
              label="Risk Band"
              value={firstDefined(eligibility.riskBand, "-")}
              color="#64748b"
            />
            <DetailRow
              icon="warning-outline"
              label="Risk Category"
              value={firstDefined(eligibility.riskCategory, "-")}
              color={riskMeta.color}
            />
            <DetailRow
              icon="cash-outline"
              label="Monthly Income"
              value={formatCurrency(eligibility.monthlyIncome)}
              color="#0f172a"
            />
            <DetailRow
              icon="footsteps-outline"
              label="Economic Footprint"
              value={formatCurrency(eligibility.totalEconomicFootprint)}
              color="#0f172a"
            />
            <DetailRow
              icon="time-outline"
              label="Last Updated"
              value={formatDate(eligibility.updatedAt)}
              color="#94a3b8"
            />
          </Card>
        </Animated.View>

        {/* Action Card (if not eligible) */}
        {!eligible && (
          <Animated.View
            style={[
              styles.actionCard,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Card style={styles.tipCard}>
              <View style={styles.tipIcon}>
                <Ionicons name="bulb-outline" size={28} color="#f59e0b" />
              </View>
              <Text style={styles.tipTitle}>How to Improve Your Score</Text>
              <View style={styles.tipList}>
                <TipItem text="Add verified rent payment records" />
                <TipItem text="Log utility and mobile money transactions" />
                <TipItem text="Keep consistent savings deposits" />
                <TipItem text="Ensure all records are marked on-time" />
              </View>
              <Pressable
                style={styles.tipButton}
                onPress={() => navigation.navigate("Payments")}
              >
                <Text style={styles.tipButtonText}>Add Records Now</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </Pressable>
            </Card>
          </Animated.View>
        )}

        {/* Eligible Action (if eligible) */}
        {eligible && (
          <Animated.View
            style={[
              styles.actionCard,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Card style={styles.eligibleCard}>
              <View style={styles.eligibleIcon}>
                <Ionicons name="checkmark-circle" size={32} color="#10b981" />
              </View>
              <Text style={styles.eligibleTitle}>You're Credit-Ready!</Text>
              <Text style={styles.eligibleText}>
                Your profile shows strong financial discipline. You can now
                access borrowing limits up to {formatCurrency(maxLimit)}.
              </Text>
              <Pressable style={styles.eligibleButton} onPress={() => {}}>
                <Text style={styles.eligibleButtonText}>View Loan Options</Text>
                <Ionicons name="arrow-forward" size={16} color="#2563eb" />
              </Pressable>
            </Card>
          </Animated.View>
        )}

        <View style={styles.footer} />
      </ScrollView>
    </Screen>
  );
}

function DetailRow({ icon, label, value, color }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLeft}>
        <Ionicons name={icon} size={18} color={color} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={[styles.detailValue, { color }]}>{value}</Text>
    </View>
  );
}

function TipItem({ text }) {
  return (
    <View style={styles.tipItem}>
      <Ionicons name="checkmark-circle-outline" size={16} color="#f59e0b" />
      <Text style={styles.tipItemText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },

  // Header
  header: {
    marginTop: 8,
    marginBottom: 16,
  },
  gradient: {
    borderRadius: 24,
    padding: 24,
    paddingTop: 20,
    overflow: "hidden",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerEyebrow: {
    color: "#93c5fd",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Score Ring
  scoreSection: {
    alignItems: "center",
  },
  ringOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  ringInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#0f172a",
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  ringStatus: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerCaption: {
    color: "#bfdbfe",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },

  // Progress
  progressCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressHint: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
  },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 24,
    letterSpacing: -0.3,
  },

  // Limits
  limitRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
  },
  limitCard: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderRadius: 20,
  },
  limitIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  limitValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },
  limitLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Risk
  riskCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
  },
  riskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  riskBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riskBadgeText: {
    fontSize: 13,
    fontWeight: "800",
  },
  riskBand: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "800",
  },

  // Action Cards
  actionCard: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  tipCard: {
    padding: 24,
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#fffaf0",
    borderWidth: 1.5,
    borderColor: "#fed7aa",
  },
  tipIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#fff7ed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 14,
  },
  tipList: {
    width: "100%",
    gap: 10,
    marginBottom: 20,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tipItemText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
    lineHeight: 20,
  },
  tipButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f59e0b",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  tipButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
  },

  // Eligible card
  eligibleCard: {
    padding: 24,
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#f0fdf4",
    borderWidth: 1.5,
    borderColor: "#bbf7d0",
  },
  eligibleIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  eligibleTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 8,
  },
  eligibleText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  eligibleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  eligibleButtonText: {
    color: "#2563eb",
    fontWeight: "900",
    fontSize: 15,
  },

  footer: {
    height: 40,
  },
});
