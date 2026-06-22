import React, { useState, useCallback, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

import Screen from "../components/Screen";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ToastProvider";
import { colors } from "../theme/colors";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { show } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [focusedField, setFocusedField] = useState(null);
  const passwordInputRef = useRef(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const update = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onSubmit = async () => {
    if (!form.email || !form.password) {
      show("Enter your email and password to continue.", "warning");
      return;
    }
    try {
      setSubmitting(true);
      await login(form);
      show("Welcome back to Xpro Score.", "success");
    } catch (error) {
      show(
        error.message || "Unable to sign in. Please check your credentials.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Brand Area */}
          <Animated.View
            style={[
              styles.brandArea,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <View style={styles.logoCircle}>
              <FontAwesome5 name="home" size={32} color="#fff" />
            </View>
            <Text style={styles.brandTitle}>Xpro Score</Text>
            <Text style={styles.brandTagline}>Tenant Credit Platform</Text>
          </Animated.View>

          {/* Main Card */}
          <View>
            <Card style={styles.mainCard}>
              <Text style={styles.welcomeText}>Welcome back</Text>
              <Text style={styles.hintText}>
                Sign in to your tenant account
              </Text>

              {/* Email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Email</Text>
                <View
                  style={[
                    styles.fieldBox,
                    focusedField === "email" &&
                      (Platform.OS === "android"
                        ? styles.fieldBoxFocusedAndroid
                        : styles.fieldBoxFocused),
                  ]}
                >
                  <TextInput
                    style={styles.fieldInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                    importantForAutofill="no"
                    keyboardType="email-address"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    placeholder="your@email.com"
                    placeholderTextColor="#cbd5e1"
                    value={form.email}
                    onChangeText={(v) => update("email", v)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                  />
                  <View style={styles.validationIconSlot}>
                    {form.email.length > 0 && (
                      <Ionicons
                        name={
                          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
                            ? "checkmark-circle"
                            : "close-circle"
                        }
                        size={18}
                        color={
                          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
                            ? "#10b981"
                            : "#ef4444"
                        }
                      />
                    )}
                  </View>
                </View>
              </View>

              {/* Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Password</Text>
                <View
                  style={[
                    styles.fieldBox,
                    focusedField === "password" &&
                      (Platform.OS === "android"
                        ? styles.fieldBoxFocusedAndroid
                        : styles.fieldBoxFocused),
                  ]}
                >
                  <TextInput
                    ref={passwordInputRef}
                    style={styles.fieldInput}
                    placeholder="••••••••"
                    placeholderTextColor="#cbd5e1"
                    secureTextEntry={secureText}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                    importantForAutofill="no"
                    returnKeyType="done"
                    value={form.password}
                    onChangeText={(v) => update("password", v)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={onSubmit}
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
              </View>

              {/* Forgot */}
              <Pressable
                style={styles.forgotRow}
                onPress={() => navigation.navigate("ResetPassword")}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>

              {/* Sign In Button */}
              <Pressable
                style={[
                  styles.signInButton,
                  (!form.email || !form.password || submitting) &&
                    styles.signInButtonDisabled,
                ]}
                onPress={onSubmit}
                disabled={!form.email || !form.password || submitting}
                android_ripple={{
                  color: "rgba(255,255,255,0.2)",
                  borderless: false,
                }}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.signInButtonText}>Sign In</Text>
                )}
              </Pressable>
            </Card>
          </View>

          {/* Bottom Actions */}
          <Animated.View style={[styles.bottomArea, { opacity: fadeAnim }]}>
            <View style={styles.registerRow}>
              <Text style={styles.registerQuestion}>New tenant? </Text>
              <Pressable onPress={() => navigation.navigate("Register")}>
                <Text style={styles.registerLink}>Create account</Text>
              </Pressable>
            </View>

            <View style={styles.securityBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#94a3b8" />
              <Text style={styles.securityText}>256-bit encrypted</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingBottom: 40,
  },

  // Brand
  brandArea: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "600",
    marginTop: 4,
  },

  // Card
  mainCard: {
    padding: 28,
    borderRadius: 24,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 6,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 4,
  },
  hintText: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 24,
  },

  // Fields
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
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
    paddingHorizontal: 16,
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
  fieldBoxFocusedAndroid: {
    borderColor: "#2563eb",
    backgroundColor: "#fff",
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
    color: "#0f172a",
    paddingVertical: 12,
    fontWeight: "600",
  },
  validationIconSlot: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  // Forgot
  forgotRow: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563eb",
  },

  // Button
  signInButton: {
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
  signInButtonDisabled: {
    opacity: 0.4,
  },
  signInButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 0.5,
  },

  // Bottom
  bottomArea: {
    marginTop: 28,
    alignItems: "center",
    gap: 16,
  },
  registerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  registerQuestion: {
    fontSize: 15,
    color: "#64748b",
    fontWeight: "600",
  },
  registerLink: {
    fontSize: 15,
    color: "#2563eb",
    fontWeight: "900",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  securityText: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
  },
});
