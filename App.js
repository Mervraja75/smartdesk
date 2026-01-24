// App.js
import React from "react";
import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import WelcomeScreen from "./screens/WelcomeScreen";
import ChatScreen from "./screens/ChatScreen";
import FaqScreen from "./screens/FaqScreen";
import HistoryScreen from "./screens/HistoryScreen";
import ConversationScreen from "./screens/ConversationScreen";

// Optional auth screens (if you added them)
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

// Auth provider / hook
import { AuthProvider, useAuth } from "./context/AuthContext";

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
const HistoryStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

//==================================
// HISTORY STACK (History → Conversation)
//==================================
function HistoryStackScreen() {
  return (
    <HistoryStack.Navigator>
      <HistoryStack.Screen
        name="HistoryHome"
        component={HistoryScreen}
        options={{
          title: "History",
          headerTitleAlign: "center",
        }}
      />
      <HistoryStack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={{
          title: "Conversation",
          headerTitleAlign: "center",
        }}
      />
    </HistoryStack.Navigator>
  );
}

//==================================
// MAIN TABS (Chat / FAQ / History)
//==================================
function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Chat"
      screenOptions={{
        headerTitleAlign: "center",
        tabBarActiveTintColor: "#3498db",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e5e7eb",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      {/* CHAT TAB */}
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: "SmartDesk",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>💬</Text>,
        }}
      />

      {/* FAQ TAB */}
      <Tab.Screen
        name="FAQ"
        component={FaqScreen}
        options={{
          title: "FAQs",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>📘</Text>,
        }}
      />

      {/* HISTORY TAB (STACK) */}
      <Tab.Screen
        name="History"
        component={HistoryStackScreen}
        options={{
          headerShown: false, // stack handles headers
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>🕘</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

//==================================
// AUTH FLOW (Login / Register)
//==================================
function AuthFlow() {
  return (
    <AuthStack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
      <AuthStack.Screen name="Register" component={RegisterScreen} options={{ title: "Create account" }} />
    </AuthStack.Navigator>
  );
}

//==================================
// ROOT NAVIGATOR (decides Welcome / Auth / MainTabs)
//==================================
function RootNavigator() {
  const { user, isGuest, loading } = useAuth();

  // Optional: show a simple loading placeholder while auth state resolves
  if (loading) return null;

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {user || isGuest ? (
        // If logged in OR continuing as guest → go straight to app
        <RootStack.Screen name="MainTabs" component={MainTabs} />
      ) : (
        // If not logged in and not a guest → show Welcome first; from Welcome user can navigate to AuthFlow
        <>
          <RootStack.Screen name="Welcome" component={WelcomeScreen} />
          <RootStack.Screen name="Auth" component={AuthFlow} />
        </>
      )}
    </RootStack.Navigator>
  );
}

//==================================
// APP (wrap with AuthProvider)
//==================================
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}