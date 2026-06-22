import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { linking } from "../config/linking";
import { useAuth } from "../context/AuthContext";
import ScreenLoader from "../components/ScreenLoader";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import PaymentsScreen from "../screens/PaymentsScreen";
import EligibilityScreen from "../screens/EligibilityScreen";
import UnitScreen from "../screens/UnitScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import { colors } from "../theme/colors";

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

// Tab icon component with badge support
function TabIcon({ name, color, size = 24, badge }) {
  return (
    <View style={styles.iconContainer}>
      <Ionicons name={name} size={size} color={color} />
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

function TenantTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#64748b",
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, focused }) => {
          const icons = {
            Home: focused ? "home" : "home-outline",
            Payments: focused ? "receipt" : "receipt-outline",
            Eligibility: focused ? "analytics" : "analytics-outline",
            Unit: focused ? "business" : "business-outline",
            Profile: focused ? "person" : "person-outline",
          };
          return <TabIcon name={icons[route.name]} color={color} size={22} />;
        },
      })}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Score" }}
      />
      <Tabs.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{ tabBarLabel: "Records" }}
      />
      <Tabs.Screen
        name="Eligibility"
        component={EligibilityScreen}
        options={{ tabBarLabel: "Status" }}
      />
      <Tabs.Screen
        name="Unit"
        component={UnitScreen}
        options={{ tabBarLabel: "Tenancy" }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tabs.Navigator>
  );
}

// Auth stack for unauthenticated users
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#f8fafc" },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          headerShown: true,
          headerTitle: "Reset Password",
          headerStyle: { backgroundColor: "#0f172a" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "900" },
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}

// Main app stack for authenticated users
function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="TenantTabs" component={TenantTabs} />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          headerShown: true,
          headerTitle: "Reset Password",
          headerStyle: { backgroundColor: "#0f172a" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "900" },
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { booting, isAuthenticated } = useAuth();

  if (booting) {
    return <ScreenLoader label="Restoring your Xpro Score session..." />;
  }

  return (
    <NavigationContainer
      linking={linking}
      theme={{
        colors: {
          background: "#f8fafc",
          card: "#fff",
          text: "#0f172a",
          border: "#e2e8f0",
          primary: "#2563eb",
          notification: "#ef4444",
        },
        dark: false,
      }}
    >
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    height: 68,
    borderRadius: 24,
    backgroundColor: "#0f172a",
    borderTopWidth: 0,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
    letterSpacing: 0.3,
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0f172a",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    paddingHorizontal: 4,
  },
});
