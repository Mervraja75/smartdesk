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

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
const HistoryStack = createNativeStackNavigator();

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
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 16 }}>💬</Text>
          ),
        }}
      />

      {/* FAQ TAB */}
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

      {/* HISTORY TAB (STACK) */}
      <Tab.Screen
        name="History"
        component={HistoryStackScreen}
        options={{
          headerShown: false, // stack handles headers
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 16 }}>🕘</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

//==================================
// APP (ROOT STACK: Welcome → Tabs)
//==================================
export default function App() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {/* INTRO SCREEN */}
        <RootStack.Screen name="Welcome" component={WelcomeScreen} />

        {/* MAIN APP */}
        <RootStack.Screen name="MainTabs" component={MainTabs} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
