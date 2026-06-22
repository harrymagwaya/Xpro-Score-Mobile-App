import React, { useEffect, useState, useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  Image,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import Screen from "../components/Screen";
import Card from "../components/Card";
import SectionHeading from "../components/SectionHeading";
import ScreenLoader from "../components/ScreenLoader";
import ErrorState from "../components/ErrorState";
import MaskedValueRow from "../components/MaskedValueRow";
import useAuth from "../hooks/useAuth";
import useUserProfile from "../hooks/useUserProfile";
import { useEligibility } from "../hooks/useEligibility";
import { useLatestScore } from "../hooks/useScoring";
import {
  useTenantCapacity,
  useTenantCapacityActions,
} from "../hooks/useTenantCapacities";
import { useUserActions } from "../hooks/useUsers";
import { useToast } from "../components/ToastProvider";
import { colors } from "../theme/colors";
import { formatCurrency, firstDefined } from "../utils/format";

// Avatar helper
function getInitials(firstName, lastName) {
  const f = firstName?.charAt(0) || "";
  const l = lastName?.charAt(0) || "";
  return (f + l).toUpperCase() || "?";
}

function getRiskColor(band) {
  const map = {
    PLATINUM: "#10b981",
    GOLD: "#f59e0b",
    SILVER: "#64748b",
    BRONZE: "#d97706",
    LOW_RISK: "#10b981",
    MEDIUM_RISK: "#f59e0b",
    HIGH_RISK: "#ef4444",
  };
  return map[band] || "#94a3b8";
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

function capacityToForm(value) {
  const capacity = value || {};

  return {
    monthlyIncome:
      capacity.monthlyIncome != null ? String(capacity.monthlyIncome) : "",
    avgMomoVolume:
      capacity.avgMomoVolume != null ? String(capacity.avgMomoVolume) : "",
    avgUtilitySpend:
      capacity.avgUtilitySpend != null ? String(capacity.avgUtilitySpend) : "",
    avgSavingsDeposit:
      capacity.avgSavingsDeposit != null
        ? String(capacity.avgSavingsDeposit)
        : "",
    avgAirtimeSpend:
      capacity.avgAirtimeSpend != null ? String(capacity.avgAirtimeSpend) : "",
    isVerified: Boolean(capacity.isVerified),
  };
}

export default function ProfileScreen({ navigation }) {
  const { logout, userId } = useAuth();
  const { show } = useToast();
  const { updateUser } = useUserActions();
  const profileResource = useUserProfile();
  const eligibilityResource = useEligibility(userId);
  const scoreResource = useLatestScore(userId);
  const { upsertTenantCapacity } = useTenantCapacityActions();
  const [editing, setEditing] = useState(false);
  const [editingCapacity, setEditingCapacity] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingCapacity, setSavingCapacity] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [capacityForm, setCapacityForm] = useState({
    monthlyIncome: "",
    avgMomoVolume: "",
    avgUtilitySpend: "",
    avgSavingsDeposit: "",
    avgAirtimeSpend: "",
    isVerified: false,
  });

  const user = profileResource.data || {};
  const eligibility = eligibilityResource.data || {};
  const tenantId = [
    eligibility.tenantId,
    user.tenantId,
    user.id,
    user.userId,
    userId,
  ].find(isUuid);
  const capacityResource = useTenantCapacity(tenantId);

  const loading = [
    profileResource.loading,
    eligibilityResource.loading,
    scoreResource.loading,
    capacityResource.loading,
  ].some(Boolean);
  const error =
    profileResource.error ||
    eligibilityResource.error ||
    scoreResource.error ||
    capacityResource.error ||
    null;

  const reload = useCallback(async () => {
    await Promise.all([
      profileResource.reload(),
      eligibilityResource.reload(),
      scoreResource.reload(),
      capacityResource.reload(),
    ]);
  }, [profileResource, eligibilityResource, scoreResource, capacityResource]);

  useEffect(() => {
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
    });
  }, [user.firstName, user.lastName, user.phoneNumber]);

  useEffect(() => {
    setCapacityForm(capacityToForm(capacityResource.data));
  }, [capacityResource.data]);

  if (loading && !profileResource.data)
    return <ScreenLoader label="Loading your profile..." />;
  if (error && !profileResource.data)
    return (
      <Screen>
        <ErrorState message={error.message} onRetry={reload} />
      </Screen>
    );

  const latestScore = firstDefined(
    scoreResource.data?.creditScore,
    scoreResource.data?.score,
    scoreResource.data?.finalScore,
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

  const riskBand = eligibility.riskBand || "PENDING";
  const riskColor = getRiskColor(riskBand);

  const saveProfile = async () => {
    try {
      setSaving(true);
      await updateUser(userId, form);
      show("Profile updated successfully.", "success");
      setEditing(false);
      await reload();
    } catch (saveError) {
      show(saveError.message || "Unable to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const saveCapacity = async () => {
    if (!tenantId) {
      show("Tenant ID is not available yet.", "error");
      return;
    }
    try {
      setSavingCapacity(true);
      await upsertTenantCapacity({
        tenantId,
        monthlyIncome: Number(capacityForm.monthlyIncome || 0),
        avgMomoVolume: Number(capacityForm.avgMomoVolume || 0),
        avgUtilitySpend: Number(capacityForm.avgUtilitySpend || 0),
        avgSavingsDeposit: Number(capacityForm.avgSavingsDeposit || 0),
        avgAirtimeSpend: Number(capacityForm.avgAirtimeSpend || 0),
        isVerified: capacityForm.isVerified,
      });
      show("Tenant capacity saved successfully.", "success");
      await capacityResource.reload();
      setEditingCapacity(false);
    } catch (saveError) {
      show(saveError.message || "Unable to save tenant capacity.", "error");
    } finally {
      setSavingCapacity(false);
    }
  };

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    "Tenant";

  return (
    <Screen refreshing={loading} onRefresh={reload}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* === HEADER / AVATAR SECTION === */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Pressable
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </Pressable>
              <Pressable
                style={styles.settingsButton}
                onPress={() => setEditing((prev) => !prev)}
              >
                <Ionicons
                  name={editing ? "close" : "create-outline"}
                  size={22}
                  color="#fff"
                />
              </Pressable>
            </View>

            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                {user.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View
                    style={[
                      styles.avatarFallback,
                      { backgroundColor: riskColor },
                    ]}
                  >
                    <Text style={styles.avatarInitials}>
                      {getInitials(user.firstName, user.lastName)}
                    </Text>
                  </View>
                )}
                <View
                  style={[styles.scoreBadge, { backgroundColor: riskColor }]}
                >
                  <Text style={styles.scoreBadgeText}>{latestScore}</Text>
                </View>
              </View>

              <Text style={styles.userName}>{fullName}</Text>
              <Text style={styles.userEmail}>
                {firstDefined(user.email, "No email registered")}
              </Text>

              <View style={styles.chipRow}>
                <View
                  style={[
                    styles.chip,
                    {
                      backgroundColor: `${riskColor}20`,
                      borderColor: riskColor,
                    },
                  ]}
                >
                  <View
                    style={[styles.chipDot, { backgroundColor: riskColor }]}
                  />
                  <Text style={[styles.chipText, { color: riskColor }]}>
                    {riskBand}
                  </Text>
                </View>
                <View
                  style={[
                    styles.chip,
                    { backgroundColor: "#2563eb20", borderColor: "#2563eb" },
                  ]}
                >
                  <Ionicons name="shield-checkmark" size={12} color="#2563eb" />
                  <Text style={[styles.chipText, { color: "#2563eb" }]}>
                    Credit Profile
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* === ELIGIBILITY SUMMARY CARD === */}
          <View style={styles.eligibilityCard}>
            <Text style={styles.sectionLabel}>Credit Eligibility</Text>
            <View style={styles.limitRow}>
              <View style={styles.limitBox}>
                <Text style={styles.limitLabel}>Min Limit</Text>
                <Text style={styles.limitValue}>
                  {formatCurrency(minLimit)}
                </Text>
              </View>
              <View style={styles.limitDivider} />
              <View style={styles.limitBox}>
                <Text style={styles.limitLabel}>Max Limit</Text>
                <Text style={styles.limitValue}>
                  {formatCurrency(maxLimit)}
                </Text>
              </View>
            </View>
            <View style={styles.riskRow}>
              <Text style={styles.riskLabel}>Risk Category</Text>
              <View
                style={[
                  styles.riskBadge,
                  { backgroundColor: `${riskColor}15` },
                ]}
              >
                <Text style={[styles.riskBadgeText, { color: riskColor }]}>
                  {eligibility.riskCategory || "PENDING"}
                </Text>
              </View>
            </View>
          </View>

          {/* === PROFILE DETAILS === */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              {!editing && (
                <Pressable
                  onPress={() => setEditing(true)}
                  style={styles.editButton}
                >
                  <Ionicons name="pencil" size={16} color="#2563eb" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.card}>
              {editing ? (
                <View style={styles.formGroup}>
                  <FormInput
                    icon="person-outline"
                    label="First name"
                    value={form.firstName}
                    onChangeText={(v) =>
                      setForm((p) => ({ ...p, firstName: v }))
                    }
                    autoCapitalize="words"
                  />
                  <FormInput
                    icon="person-outline"
                    label="Last name"
                    value={form.lastName}
                    onChangeText={(v) =>
                      setForm((p) => ({ ...p, lastName: v }))
                    }
                    autoCapitalize="words"
                  />
                  <FormInput
                    icon="call-outline"
                    label="Phone number"
                    value={form.phoneNumber}
                    onChangeText={(v) =>
                      setForm((p) => ({ ...p, phoneNumber: v }))
                    }
                    keyboardType="phone-pad"
                  />
                  <Pressable
                    style={styles.saveButton}
                    onPress={saveProfile}
                    disabled={saving}
                  >
                    <Text style={styles.saveButtonText}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View>
                  <InfoRow
                    icon="person-outline"
                    label="First name"
                    value={firstDefined(user.firstName, "-")}
                  />
                  <InfoRow
                    icon="person-outline"
                    label="Last name"
                    value={firstDefined(user.lastName, "-")}
                  />
                  <InfoRow
                    icon="call-outline"
                    label="Phone"
                    value={firstDefined(user.phoneNumber, "-")}
                  />
                  <InfoRow
                    icon="mail-outline"
                    label="Email"
                    value={firstDefined(user.email, "-")}
                  />
                </View>
              )}
            </View>
          </View>

          {/* === TENANT CAPACITY === */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Financial Capacity</Text>
              {!editingCapacity && (
                <Pressable
                  onPress={() => setEditingCapacity(true)}
                  style={styles.editButton}
                >
                  <Ionicons name="pencil" size={16} color="#2563eb" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>
              )}
            </View>
            <View style={styles.card}>
              <Text style={styles.cardSubtitle}>
                Monthly averages help us assess your eligibility
              </Text>

              {editingCapacity ? (
                <>
                  <FormInput
                    icon="wallet-outline"
                    label="Monthly income (UGX)"
                    value={capacityForm.monthlyIncome}
                    onChangeText={(v) =>
                      setCapacityForm((p) => ({ ...p, monthlyIncome: v }))
                    }
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <FormInput
                    icon="phone-portrait-outline"
                    label="Average MoMo volume"
                    value={capacityForm.avgMomoVolume}
                    onChangeText={(v) =>
                      setCapacityForm((p) => ({ ...p, avgMomoVolume: v }))
                    }
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <FormInput
                    icon="flash-outline"
                    label="Average utility spend"
                    value={capacityForm.avgUtilitySpend}
                    onChangeText={(v) =>
                      setCapacityForm((p) => ({ ...p, avgUtilitySpend: v }))
                    }
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <FormInput
                    icon="save-outline"
                    label="Average savings deposit"
                    value={capacityForm.avgSavingsDeposit}
                    onChangeText={(v) =>
                      setCapacityForm((p) => ({ ...p, avgSavingsDeposit: v }))
                    }
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <FormInput
                    icon="wifi-outline"
                    label="Average airtime spend"
                    value={capacityForm.avgAirtimeSpend}
                    onChangeText={(v) =>
                      setCapacityForm((p) => ({ ...p, avgAirtimeSpend: v }))
                    }
                    keyboardType="numeric"
                    placeholder="0"
                  />

                  <View style={styles.verifyRow}>
                    <View style={styles.verifyInfo}>
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={20}
                        color={
                          capacityForm.isVerified ? "#10b981" : "#94a3b8"
                        }
                      />
                      <View>
                        <Text style={styles.verifyLabel}>
                          Verified Capacity
                        </Text>
                        <Text style={styles.verifyHint}>
                          Mark if data is confirmed
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={capacityForm.isVerified}
                      onValueChange={(v) =>
                        setCapacityForm((p) => ({ ...p, isVerified: v }))
                      }
                      trackColor={{ false: "#e2e8f0", true: "#10b981" }}
                      thumbColor="#fff"
                    />
                  </View>

                  <View style={styles.capacityActions}>
                    <Pressable
                      style={styles.cancelButton}
                      onPress={() => {
                        setCapacityForm(capacityToForm(capacityResource.data));
                        setEditingCapacity(false);
                      }}
                      disabled={savingCapacity}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.saveButton, styles.capacitySaveButton]}
                      onPress={saveCapacity}
                      disabled={savingCapacity}
                    >
                      <Text style={styles.saveButtonText}>
                        {savingCapacity ? "Saving..." : "Save Capacity"}
                      </Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <View>
                  <InfoRow
                    icon="wallet-outline"
                    label="Monthly income"
                    value={formatCurrency(capacityForm.monthlyIncome)}
                  />
                  <InfoRow
                    icon="phone-portrait-outline"
                    label="Average MoMo volume"
                    value={formatCurrency(capacityForm.avgMomoVolume)}
                  />
                  <InfoRow
                    icon="flash-outline"
                    label="Average utility spend"
                    value={formatCurrency(capacityForm.avgUtilitySpend)}
                  />
                  <InfoRow
                    icon="save-outline"
                    label="Average savings deposit"
                    value={formatCurrency(capacityForm.avgSavingsDeposit)}
                  />
                  <InfoRow
                    icon="wifi-outline"
                    label="Average airtime spend"
                    value={formatCurrency(capacityForm.avgAirtimeSpend)}
                  />
                  <InfoRow
                    icon="shield-checkmark-outline"
                    label="Verification"
                    value={capacityForm.isVerified ? "Verified" : "Not verified"}
                  />
                </View>
              )}
            </View>
          </View>

          {/* === SECURITY === */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security</Text>
            <View style={styles.card}>
              <MaskedValueRow label="Tenant ID" value={tenantId} />
              <View style={styles.divider} />
              <Pressable
                style={styles.actionRow}
                onPress={() => navigation.navigate("ResetPassword")}
              >
                <View style={styles.actionRowLeft}>
                  <View
                    style={[styles.actionIcon, { backgroundColor: "#f1f5f9" }]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color="#64748b"
                    />
                  </View>
                  <View>
                    <Text style={styles.actionLabel}>Reset Password</Text>
                    <Text style={styles.actionHint}>
                      Change your account password
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
              </Pressable>
            </View>
          </View>

          {/* === SIGN OUT === */}
          <Pressable style={styles.signOutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>

          <View style={styles.footer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

// === Sub-components ===

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoRowLeft}>
        <Ionicons name={icon} size={18} color="#94a3b8" />
        <View>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      </View>
    </View>
  );
}

function FormInput({
  icon,
  label,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
  placeholder,
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <View style={styles.formInputContainer}>
        <Ionicons
          name={icon}
          size={18}
          color="#94a3b8"
          style={styles.formInputIcon}
        />
        <TextInput
          style={styles.formInput}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          placeholder={placeholder}
          placeholderTextColor="#cbd5e1"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Header
  header: {
    backgroundColor: "#0f172a",
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    paddingBottom: 80,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Avatar
  avatarSection: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
  },
  scoreBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#0f172a",
    paddingHorizontal: 6,
  },
  scoreBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
  userName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 4,
  },
  chipRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "800",
  },

  // Eligibility floating card
  eligibilityCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -50,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 14,
  },
  limitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  limitBox: {
    flex: 1,
    alignItems: "center",
  },
  limitLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "700",
    marginBottom: 4,
  },
  limitValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
  },
  limitDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e2e8f0",
  },
  riskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  riskLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  riskBadgeText: {
    fontSize: 13,
    fontWeight: "800",
  },

  // Sections
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2563eb",
  },

  // Cards
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 16,
    lineHeight: 18,
  },

  // Info rows
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  infoRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  infoLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "700",
  },

  // Form
  formGroup: {
    gap: 14,
  },
  formField: {
    gap: 6,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    marginLeft: 4,
  },
  formInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 2,
    backgroundColor: "#f8fafc",
    gap: 10,
  },
  formInputIcon: {
    marginLeft: 2,
  },
  formInput: {
    flex: 1,
    fontSize: 16,
    color: "#0f172a",
    paddingVertical: 12,
    fontWeight: "500",
  },

  // Verify row
  verifyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  verifyInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  verifyLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  verifyHint: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 1,
  },

  // Buttons
  saveButton: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  capacityActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  capacitySaveButton: {
    flex: 1,
    marginTop: 0,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  cancelButtonText: {
    color: "#475569",
    fontWeight: "900",
    fontSize: 15,
  },

  // Action rows
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  actionRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  actionHint: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 1,
  },

  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 4,
  },

  // Sign out
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ef4444",
  },

  footer: {
    height: 40,
  },
});
