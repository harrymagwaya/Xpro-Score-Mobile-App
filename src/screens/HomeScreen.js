import React from "react";
import { Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import Screen from "../components/Screen";
import Card from "../components/Card";
import ScreenLoader from "../components/ScreenLoader";
import ErrorState from "../components/ErrorState";
import useAuth from "../hooks/useAuth";
import useUserProfile from "../hooks/useUserProfile";
import { useEligibility } from "../hooks/useEligibility";
import { useTenantFinancialHistory } from "../hooks/useFinancial";
import { useUnitByTenant } from "../hooks/usePropertyUnits";
import { useLatestScore } from "../hooks/useScoring";
import { useRentalProfilesByTenant } from "../hooks/useRentalProfile";
import { useTenantCapacity } from "../hooks/useTenantCapacities";
import {
  extractList,
  firstDefined,
  formatCurrency,
  formatDate,
} from "../utils/format";

export default function HomeScreen({ navigation }) {
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
    capacityResource.loading,
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
      capacityResource.reload(),
    ]);
  };

  if (loading && !profileResource.data)
    return <ScreenLoader label="Loading your credit dashboard..." />;
  if (error && !profileResource.data)
    return (
      <Screen>
        <ErrorState message={error.message} onRetry={reload} />
      </Screen>
    );

  const profile = profileResource.data || {};
  const score = scoreResource.data || {};
  const eligibility = eligibilityResource.data || {};
  const records = extractList(historyResource.data);
  const unit = unitResource.data || {};
  const rentalProfiles = extractList(rentalProfileResource.data);
  const latestScore = firstDefined(
    score.creditScore,
    score.score,
    score.finalScore,
    0,
  );
  const minLimit = firstDefined(
    eligibility.minEligibleLimit,
    eligibility.minimumLimit,
    eligibility.minLimit,
    eligibility.minimumEligibleAmount,
    eligibility.minimumAmount,
    "-",
  );
  const maxLimit = firstDefined(
    eligibility.maxEligibleLimit,
    eligibility.maximumLimit,
    eligibility.maxLimit,
    eligibility.maximumEligibleAmount,
    eligibility.maximumAmount,
    "-",
  );
  const capacityValue = firstDefined(
    capacityResource.data?.capacityScore,
    capacityResource.data?.score,
    capacityResource.data?.tenantCapacity,
    capacityResource.data?.financialCapacity,
    capacityResource.data?.capacity,
    "-",
  );
  const firstName = firstDefined(profile.firstName, profile.username, "Tenant");
  const eligible =
    eligibility.isCalculationAllowed ?? eligibility.calculationAllowed;
  const onTimeCount = records.filter(
    (r) => String(r.status || "").toUpperCase() === "ON_TIME",
  ).length;
  const totalValue = records.reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const hasTenancy =
    !!unit.id ||
    !!unit.unitId ||
    rentalProfiles.length > 0 ||
    !!unit.propertyName;

  const scoreColor =
    latestScore >= 700 ? "#10b981" : latestScore >= 400 ? "#f59e0b" : "#ef4444";
  const scoreBg =
    latestScore >= 700 ? "#ecfdf5" : latestScore >= 400 ? "#fffbeb" : "#fef2f2";

  return (
    <Screen refreshing={loading} onRefresh={reload}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Light Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Good day, {firstName} 👋</Text>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
            <Pressable
              style={styles.avatarButton}
              onPress={() => navigation.navigate("Profile")}
            >
              <View
                style={[styles.avatarCircle, { backgroundColor: scoreColor }]}
              >
                <Text style={styles.avatarText}>
                  {firstName.charAt(0).toUpperCase()}
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Score Ring - kept from first design */}
          <View style={styles.scoreSection}>
            <View style={styles.scoreRing}>
              <View style={[styles.scoreInner, { borderColor: scoreColor }]}>
                <Text style={[styles.scoreValue, { color: scoreColor }]}>
                  {latestScore}
                </Text>
                <Text style={styles.scoreLabel}>CREDIT SCORE</Text>
              </View>
            </View>
            <Text style={styles.scoreCaption}>
              {firstDefined(
                eligibility.statusMessage,
                eligibility.riskBand,
                "Keep adding verified financial activity",
              )}
            </Text>
          </View>
        </View>

        {/* Floating Action Bar */}
        <View style={styles.actionBar}>
          <Pressable
            style={styles.actionPill}
            onPress={() => navigation.navigate("Payments")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#eff6ff" }]}>
              <Ionicons name="add-circle" size={22} color="#2563eb" />
            </View>
            <Text style={styles.actionLabel}>Add Record</Text>
          </Pressable>
          <Pressable
            style={styles.actionPill}
            onPress={() => navigation.navigate("Eligibility")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#f0fdf4" }]}>
              <Ionicons name="trending-up" size={22} color="#16a34a" />
            </View>
            <Text style={styles.actionLabel}>Eligibility</Text>
          </Pressable>
          <Pressable
            style={styles.actionPill}
            onPress={() => navigation.navigate("Profile")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#fef3c7" }]}>
              <Ionicons name="person" size={22} color="#d97706" />
            </View>
            <Text style={styles.actionLabel}>Profile</Text>
          </Pressable>
        </View>

        {/* Borrowing Limits */}
        <Text style={styles.sectionTitle}>Borrowing Power</Text>
        <View style={styles.limitGrid}>
          <Card style={styles.limitCard}>
            <Ionicons name="arrow-down-circle" size={24} color="#2563eb" />
            <Text
              style={styles.limitValue}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {formatCurrency(minLimit)}
            </Text>
            <Text style={styles.limitLabel}>Min Limit</Text>
          </Card>
          <Card style={styles.limitCard}>
            <Ionicons name="arrow-up-circle" size={24} color="#10b981" />
            <Text
              style={styles.limitValue}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {formatCurrency(maxLimit)}
            </Text>
            <Text style={styles.limitLabel}>Max Limit</Text>
          </Card>
        </View>

        {/* Financial Health */}
        <Text style={styles.sectionTitle}>Financial Health</Text>
        <Card style={styles.signalCard}>
          <SignalRow
            icon="wallet-outline"
            color="#2563eb"
            label="Borrow Capacity"
            value={String(capacityValue)}
          />
          <SignalRow
            icon="checkmark-circle-outline"
            color="#10b981"
            label="Positive Records"
            value={String(onTimeCount)}
          />
          <SignalRow
            icon="shield-checkmark-outline"
            color="#f59e0b"
            label="Eligibility"
            value={eligible ? "Approved" : "Needs Review"}
            highlight={eligible}
          />
          <SignalRow
            icon="cash-outline"
            color="#64748b"
            label="Recorded Value"
            value={formatCurrency(totalValue)}
          />
        </Card>

        {/* Credit Profile */}
        <Text style={styles.sectionTitle}>Credit Profile</Text>
        <Card style={styles.detailCard}>
          <DetailRow
            label="Risk Band"
            value={firstDefined(eligibility.riskBand, "-")}
          />
          <DetailRow
            label="Monthly Income"
            value={formatCurrency(eligibility.monthlyIncome)}
          />
          <DetailRow
            label="Economic Footprint"
            value={formatCurrency(eligibility.totalEconomicFootprint)}
          />
          <DetailRow
            label="Last Updated"
            value={formatDate(eligibility.updatedAt)}
          />
        </Card>

        {/* Tenancy - Conditional */}
        {hasTenancy ? (
          <>
            <Text style={styles.sectionTitle}>My Tenancy</Text>
            <Card style={styles.tenancyCard}>
              <View style={styles.tenancyHeader}>
                <View style={styles.tenancyIcon}>
                  <Ionicons name="home" size={24} color="#2563eb" />
                </View>
                <View>
                  <Text style={styles.tenancyProperty}>
                    {firstDefined(
                      unit.propertyName,
                      unit.property?.name,
                      "My Property",
                    )}
                  </Text>
                  <Text style={styles.tenancyUnit}>
                    Unit {firstDefined(unit.unitName, unit.unitNumber, "-")}
                  </Text>
                </View>
              </View>
              <View style={styles.tenancyMeta}>
                <Text style={styles.tenancyStatus}>
                  {firstDefined(rentalProfiles[0]?.status, "Active")}
                </Text>
                <Text style={styles.tenancyDate}>
                  Since {formatDate(rentalProfiles[0]?.createdAt)}
                </Text>
              </View>
            </Card>
          </>
        ) : (
          <Card style={styles.noTenancyCard}>
            <View style={styles.noTenancyIcon}>
              <Ionicons name="home-outline" size={32} color="#cbd5e1" />
            </View>
            <Text style={styles.noTenancyTitle}>No Tenancy Linked</Text>
            <Text style={styles.noTenancyDesc}>
              You haven't been assigned to a property yet. Contact your landlord
              to link your tenancy.
            </Text>
            <Pressable
              style={styles.noTenancyButton}
              onPress={() => navigation.navigate("Profile")}
            >
              <Text style={styles.noTenancyButtonText}>Complete Profile</Text>
            </Pressable>
          </Card>
        )}

        <View style={styles.footer} />
      </ScrollView>
    </Screen>
  );
}

function SignalRow({ icon, color, label, value, highlight }) {
  return (
    <View style={styles.signalRow}>
      <View style={[styles.signalIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.signalInfo}>
        <Text style={styles.signalLabel}>{label}</Text>
        <Text style={[styles.signalValue, highlight && styles.signalHighlight]}>
          {value}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
    </View>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
    backgroundColor: "#f8fafc",
  },

  // Header — light instead of dark
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    color: "#0f172a",
    fontSize: 22,
    fontWeight: "900",
    flex: 1,
  },
  dateText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },

  // Score Ring — kept from first design
  scoreSection: {
    alignItems: "center",
  },
  scoreRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  scoreInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: "900",
  },
  scoreLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  scoreCaption: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },

  // Action Bar
  actionBar: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: -24,
    marginBottom: 24,
  },
  actionPill: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
  },

  // Sections
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
  limitGrid: {
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
    backgroundColor: "#fff",
  },
  limitValue: {
    width: "100%",
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
    textAlign: "center",
  },
  limitLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Signals
  signalCard: {
    marginHorizontal: 20,
    padding: 8,
    gap: 4,
    backgroundColor: "#fff",
  },
  signalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  signalIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  signalInfo: {
    flex: 1,
  },
  signalLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 2,
  },
  signalValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  signalHighlight: {
    color: "#16a34a",
  },

  // Details
  detailCard: {
    marginHorizontal: 20,
    padding: 16,
    gap: 2,
    backgroundColor: "#fff",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  detailLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "800",
  },

  // Tenancy
  tenancyCard: {
    marginHorizontal: 20,
    padding: 20,
    gap: 16,
    backgroundColor: "#fff",
  },
  tenancyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  tenancyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  tenancyProperty: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  tenancyUnit: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
    marginTop: 2,
  },
  tenancyMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  tenancyStatus: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tenancyDate: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "600",
  },

  // No Tenancy
  noTenancyCard: {
    marginHorizontal: 20,
    padding: 32,
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#f1f5f9",
    borderStyle: "dashed",
  },
  noTenancyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  noTenancyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 8,
  },
  noTenancyDesc: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  noTenancyButton: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  noTenancyButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },

  footer: {
    height: 40,
  },
});
