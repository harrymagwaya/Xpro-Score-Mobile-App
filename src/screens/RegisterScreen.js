import React, { useState, useCallback, useRef } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

import Screen from "../components/Screen";
import Card from "../components/Card";
import { useToast } from "../components/ToastProvider";
import { registerTenant } from "../api/auth";

const genderOptions = ["MALE", "FEMALE"];

const initialForm = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  phoneNumber: "",
  gender: "",
};

const initialErrors = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  phoneNumber: "",
};

export default function RegisterScreen({ navigation }) {
  const { show } = useToast();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [submitting, setSubmitting] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  }, []);

  const update = useCallback(
    (key, value) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      if (errors[key]) {
        setErrors((prev) => ({ ...prev, [key]: "" }));
      }
    },
    [errors],
  );

  const validateField = (key, value) => {
    switch (key) {
      case "firstName":
        return value.trim().length < 2
          ? "First name must be at least 2 characters"
          : "";
      case "lastName":
        return value.trim().length < 2
          ? "Last name must be at least 2 characters"
          : "";
      case "username":
        return value.trim().length < 3
          ? "Username must be at least 3 characters"
          : "";
      case "email":
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? "Enter a valid email address"
          : "";
      case "password":
        return value.length < 8 ? "Password must be at least 8 characters" : "";
      case "phoneNumber":
        return !/^\+?[0-9]{10,15}$/.test(value.replace(/\s/g, ""))
          ? "Enter a valid phone number (e.g., +256...)"
          : "";
      default:
        return "";
    }
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;
    Object.keys(initialErrors).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });
    setErrors(newErrors);
    return isValid;
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = getPasswordStrength(form.password);
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

  const submit = async () => {
    if (!validateAll()) {
      show("Please fix the errors in the form.", "warning");
      return;
    }
    if (!agreedToTerms) {
      show(
        "Please agree to the Terms and Privacy Policy to continue.",
        "warning",
      );
      return;
    }

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      username: form.username.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      phoneNumber: form.phoneNumber.trim().replace(/\s/g, ""),
      gender: form.gender.trim(),
    };

    try {
      setSubmitting(true);
      await registerTenant(payload);
      show("Welcome to Xpro Score! Your credit profile is ready.", "success");
      navigation.replace("Login");
    } catch (error) {
      show(
        error.message || "Unable to create your account. Please try again.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll={false}>
      <View style={styles.root}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          enabled={Platform.OS !== "web"}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={Platform.OS !== "web"}
          >
            {/* Header with Back Button */}
            <Animated.View
              style={[
                styles.header,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              <LinearGradient
                colors={["#0f172a", "#1e3a8a", "#2563eb"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              >
                <Pressable
                  style={styles.backButton}
                  onPress={() => navigation.replace("Login")}
                >
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>

                <View style={styles.brandBadge}>
                  <FontAwesome5 name="chart-line" size={16} color="#fff" />
                  <Text style={styles.brandText}>Xpro Score</Text>
                </View>

                <Text style={styles.eyebrow}>Your Financial Reputation</Text>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>
                  Build your credit profile with rent, utilities, savings, and
                  mobile money activity.
                </Text>
              </LinearGradient>
            </Animated.View>

            {/* Form Card */}
            <Animated.View
              style={[
                styles.formWrapper,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              <Card style={styles.formCard}>
                <Text style={styles.formTitle}>Personal Details</Text>
                <Text style={styles.formText}>
                  Required to set up your behavioral credit profile
                </Text>

                {/* Name Row */}
                <View style={styles.rowInputs}>
                  <View style={styles.halfField}>
                    <Text style={styles.fieldLabel}>First Name</Text>
                    <View
                      style={[
                        styles.fieldBox,
                        focusedField === "firstName" && styles.fieldBoxFocused,
                        errors.firstName && styles.fieldBoxError,
                      ]}
                    >
                      <TextInput
                        style={styles.fieldInput}
                        autoCapitalize="words"
                        placeholder="John"
                        placeholderTextColor="#cbd5e1"
                        value={form.firstName}
                        onChangeText={(v) => update("firstName", v)}
                        onFocus={() => setFocusedField("firstName")}
                        onBlur={() => {
                          setFocusedField(null);
                          const err = validateField(
                            "firstName",
                            form.firstName,
                          );
                          if (err) setErrors((p) => ({ ...p, firstName: err }));
                        }}
                      />
                    </View>
                    {errors.firstName ? (
                      <Text style={styles.fieldError}>{errors.firstName}</Text>
                    ) : null}
                  </View>

                  <View style={styles.halfField}>
                    <Text style={styles.fieldLabel}>Last Name</Text>
                    <View
                      style={[
                        styles.fieldBox,
                        focusedField === "lastName" && styles.fieldBoxFocused,
                        errors.lastName && styles.fieldBoxError,
                      ]}
                    >
                      <TextInput
                        style={styles.fieldInput}
                        autoCapitalize="words"
                        placeholder="Doe"
                        placeholderTextColor="#cbd5e1"
                        value={form.lastName}
                        onChangeText={(v) => update("lastName", v)}
                        onFocus={() => setFocusedField("lastName")}
                        onBlur={() => {
                          setFocusedField(null);
                          const err = validateField("lastName", form.lastName);
                          if (err) setErrors((p) => ({ ...p, lastName: err }));
                        }}
                      />
                    </View>
                    {errors.lastName ? (
                      <Text style={styles.fieldError}>{errors.lastName}</Text>
                    ) : null}
                  </View>
                </View>

                {/* Username */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Username</Text>
                  <View
                    style={[
                      styles.fieldBox,
                      focusedField === "username" && styles.fieldBoxFocused,
                      errors.username && styles.fieldBoxError,
                    ]}
                  >
                    <Ionicons
                      name="at-outline"
                      size={18}
                      color={
                        focusedField === "username" ? "#2563eb" : "#94a3b8"
                      }
                      style={styles.fieldIcon}
                    />
                    <TextInput
                      style={styles.fieldInput}
                      autoCapitalize="none"
                      placeholder="johndoe"
                      placeholderTextColor="#cbd5e1"
                      value={form.username}
                      onChangeText={(v) => update("username", v)}
                      onFocus={() => setFocusedField("username")}
                      onBlur={() => {
                        setFocusedField(null);
                        const err = validateField("username", form.username);
                        if (err) setErrors((p) => ({ ...p, username: err }));
                      }}
                    />
                  </View>
                  {errors.username ? (
                    <Text style={styles.fieldError}>{errors.username}</Text>
                  ) : null}
                </View>

                {/* Email */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Email Address</Text>
                  <View
                    style={[
                      styles.fieldBox,
                      focusedField === "email" && styles.fieldBoxFocused,
                      errors.email && styles.fieldBoxError,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={focusedField === "email" ? "#2563eb" : "#94a3b8"}
                      style={styles.fieldIcon}
                    />
                    <TextInput
                      style={styles.fieldInput}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      placeholder="name@example.com"
                      placeholderTextColor="#cbd5e1"
                      value={form.email}
                      onChangeText={(v) => update("email", v)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => {
                        setFocusedField(null);
                        const err = validateField("email", form.email);
                        if (err) setErrors((p) => ({ ...p, email: err }));
                      }}
                    />
                    {form.email.length > 0 && !errors.email && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#10b981"
                      />
                    )}
                  </View>
                  {errors.email ? (
                    <Text style={styles.fieldError}>{errors.email}</Text>
                  ) : null}
                </View>

                {/* Phone */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Phone Number</Text>
                  <View
                    style={[
                      styles.fieldBox,
                      focusedField === "phoneNumber" && styles.fieldBoxFocused,
                      errors.phoneNumber && styles.fieldBoxError,
                    ]}
                  >
                    <Ionicons
                      name="call-outline"
                      size={18}
                      color={
                        focusedField === "phoneNumber" ? "#2563eb" : "#94a3b8"
                      }
                      style={styles.fieldIcon}
                    />
                    <TextInput
                      style={styles.fieldInput}
                      keyboardType="phone-pad"
                      placeholder="+256 700 000 000"
                      placeholderTextColor="#cbd5e1"
                      value={form.phoneNumber}
                      onChangeText={(v) => update("phoneNumber", v)}
                      onFocus={() => setFocusedField("phoneNumber")}
                      onBlur={() => {
                        setFocusedField(null);
                        const err = validateField(
                          "phoneNumber",
                          form.phoneNumber,
                        );
                        if (err) setErrors((p) => ({ ...p, phoneNumber: err }));
                      }}
                    />
                  </View>
                  {errors.phoneNumber ? (
                    <Text style={styles.fieldError}>{errors.phoneNumber}</Text>
                  ) : null}
                </View>

                {/* Password */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <View
                    style={[
                      styles.fieldBox,
                      focusedField === "password" && styles.fieldBoxFocused,
                      errors.password && styles.fieldBoxError,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={
                        focusedField === "password" ? "#2563eb" : "#94a3b8"
                      }
                      style={styles.fieldIcon}
                    />
                    <TextInput
                      style={styles.fieldInput}
                      secureTextEntry={secureText}
                      placeholder="Min 8 characters"
                      placeholderTextColor="#cbd5e1"
                      value={form.password}
                      onChangeText={(v) => update("password", v)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => {
                        setFocusedField(null);
                        const err = validateField("password", form.password);
                        if (err) setErrors((p) => ({ ...p, password: err }));
                      }}
                    />
                    <Pressable
                      onPress={() => setSecureText(!secureText)}
                      hitSlop={8}
                    >
                      <Ionicons
                        name={secureText ? "eye-off" : "eye"}
                        size={18}
                        color="#94a3b8"
                      />
                    </Pressable>
                  </View>
                  {errors.password ? (
                    <Text style={styles.fieldError}>{errors.password}</Text>
                  ) : null}

                  {/* Strength */}
                  {form.password.length > 0 && (
                    <View style={styles.strengthBox}>
                      <View style={styles.strengthBar}>
                        {[1, 2, 3, 4].map((level) => (
                          <View
                            key={level}
                            style={[
                              styles.strengthSegment,
                              level <= strength
                                ? {
                                    backgroundColor:
                                      strengthColors[strength - 1],
                                  }
                                : { backgroundColor: "#e2e8f0" },
                            ]}
                          />
                        ))}
                      </View>
                      <Text
                        style={[
                          styles.strengthLabel,
                          { color: strengthColors[strength - 1] || "#94a3b8" },
                        ]}
                      >
                        {strength > 0
                          ? strengthLabels[strength - 1]
                          : "Enter password"}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Gender */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Gender <Text style={styles.optional}>(optional)</Text>
                  </Text>
                  <View style={styles.genderRow}>
                    {genderOptions.map((option) => {
                      const selected = form.gender === option;
                      return (
                        <Pressable
                          key={option}
                          style={[
                            styles.genderChip,
                            selected && styles.genderChipActive,
                          ]}
                          onPress={() =>
                            update("gender", selected ? "" : option)
                          }
                        >
                          <Ionicons
                            name={option === "MALE" ? "male" : "female"}
                            size={16}
                            color={selected ? "#2563eb" : "#64748b"}
                          />
                          <Text
                            style={[
                              styles.genderChipText,
                              selected && styles.genderChipTextActive,
                            ]}
                          >
                            {option.charAt(0) + option.slice(1).toLowerCase()}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Terms */}
                <Pressable
                  style={styles.termsRow}
                  onPress={() => setAgreedToTerms(!agreedToTerms)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      agreedToTerms && styles.checkboxChecked,
                    ]}
                  >
                    {agreedToTerms && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.termsText}>
                    I agree to the{" "}
                    <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </Pressable>

                {/* Submit */}
                <Pressable
                  style={[
                    styles.submitButton,
                    (submitting || !agreedToTerms) &&
                      styles.submitButtonDisabled,
                  ]}
                  onPress={submit}
                  disabled={submitting || !agreedToTerms}
                  android_ripple={{
                    color: "rgba(255,255,255,0.2)",
                    borderless: false,
                  }}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      Create Account & Start Building Credit
                    </Text>
                  )}
                </Pressable>

                {/* Login Link */}
                <Pressable
                  onPress={() => navigation.replace("Login")}
                  style={styles.loginRow}
                >
                  <Text style={styles.loginText}>
                    Already have an account?{" "}
                    <Text style={styles.loginLink}>Sign in</Text>
                  </Text>
                </Pressable>
              </Card>
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
              <Ionicons name="shield-checkmark" size={14} color="#94a3b8" />
              <Text style={styles.footerText}>
                Your data is encrypted and never sold to third parties.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: Platform.OS === "web" ? 96 : 48,
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
    gap: 10,
    overflow: "hidden",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  brandBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  brandText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  eyebrow: {
    color: "#93c5fd",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontSize: 12,
    marginTop: 4,
  },
  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#bfdbfe",
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },

  // Form Card
  formWrapper: {
    marginBottom: 16,
  },
  formCard: {
    padding: 24,
    borderRadius: 24,
    gap: 4,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  formText: {
    color: "#64748b",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },

  // Fields
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 6,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#f1f5f9",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: "#f8fafc",
    gap: 10,
  },
  fieldBoxFocused: {
    borderColor: "#2563eb",
    backgroundColor: "#fff",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldBoxError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  fieldIcon: {
    marginLeft: 2,
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
    color: "#0f172a",
    paddingVertical: 12,
    fontWeight: "600",
  },
  fieldError: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
    marginTop: 4,
  },

  // Row inputs (first/last name)
  rowInputs: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  halfField: {
    flex: 1,
  },

  // Strength
  strengthBox: {
    marginTop: 8,
    gap: 6,
  },
  strengthBar: {
    flexDirection: "row",
    gap: 4,
    height: 4,
  },
  strengthSegment: {
    flex: 1,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
  },

  // Gender
  optional: {
    color: "#94a3b8",
    fontWeight: "500",
    textTransform: "none",
    letterSpacing: 0,
  },
  genderRow: {
    flexDirection: "row",
    gap: 12,
  },
  genderChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#f1f5f9",
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: "#f8fafc",
  },
  genderChipActive: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  genderChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
  },
  genderChipTextActive: {
    color: "#2563eb",
  },

  // Terms
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  termsText: {
    flex: 1,
    color: "#64748b",
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    color: "#2563eb",
    fontWeight: "800",
  },

  // Submit
  submitButton: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 0.3,
  },

  // Login link
  loginRow: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 8,
  },
  loginText: {
    color: "#64748b",
    fontSize: 15,
    fontWeight: "500",
  },
  loginLink: {
    color: "#2563eb",
    fontWeight: "800",
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  footerText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "500",
  },
});
