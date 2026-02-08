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

// Auth screens
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

// SmartDesk screens
import SmartDeskHomeScreen from "./screens/SmartDeskHomeScreen";
import CategoryScreen from "./screens/CategoryScreen";

// Auth provider / hook
import { AuthProvider, useAuth } from "./context/AuthContext";

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
const HistoryStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const SmartDeskStack = createNativeStackNavigator();

//==================================
// HISTORY STACK (History → Conversation)
//==================================
function HistoryStackScreen() {
  return (
    <HistoryStack.Navigator>
      <HistoryStack.Screen
        name="HistoryHome"
        component={HistoryScreen}
        options={{ title: "History", headerTitleAlign: "center" }}
      />
      <HistoryStack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={{ title: "Conversation", headerTitleAlign: "center" }}
      />
    </HistoryStack.Navigator>
  );
}

//==================================
// SMARTDESK STACK (Home → Category)
//==================================
function SmartDeskStackScreen() {
  return (
    <SmartDeskStack.Navigator>
      <SmartDeskStack.Screen
        name="SmartDeskHome"
        component={SmartDeskHomeScreen}
        options={{ title: "SmartDesk", headerTitleAlign: "center" }}
      />
      <SmartDeskStack.Screen
        name="Category"
        component={CategoryScreen}
        options={({ route }) => ({
          title: route?.params?.title || "Category",
          headerTitleAlign: "center",
        })}
      />
    </SmartDeskStack.Navigator>
  );
}

//==================================
// MAIN TABS (SmartDesk / Chat / FAQ / History)
//==================================
function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="SmartDesk"
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
      <Tab.Screen
        name="SmartDesk"
        component={SmartDeskStackScreen}
        options={{
          headerShown: false,
          title: "SmartDesk",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 16 }}>🧰</Text>
          ),
        }}
      />

      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 16 }}>💬</Text>
          ),
        }}
      />

      <Tab.Screen
        name="FAQ"
        component={FaqScreen}
        options={{
          title: "FAQs",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 16 }}>📘</Text>
          ),
        }}
      />

      <Tab.Screen
        name="History"
        component={HistoryStackScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 16 }}>🕘</Text>
          ),
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
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "Login" }}
      />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: "Create account" }}
      />
    </AuthStack.Navigator>
  );
}

//==================================
// ROOT NAVIGATOR
// - If logged in OR guest -> MainTabs
// - else -> Welcome first, then Auth
//==================================
function RootNavigator() {
  const { user, isGuest, loading } = useAuth();

  if (loading) return null;

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {user || isGuest ? (
        <RootStack.Screen name="MainTabs" component={MainTabs} />
      ) : (
        <>
          {/* ✅ SHOW THIS FIRST */}
          <RootStack.Screen name="Welcome" component={WelcomeScreen} />
          <RootStack.Screen name="Auth" component={AuthFlow} />
        </>
      )}
    </RootStack.Navigator>
  );
}

//==================================
// APP
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