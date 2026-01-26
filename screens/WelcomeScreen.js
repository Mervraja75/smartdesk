// screens/WelcomeScreen.js
import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function WelcomeScreen({ navigation }) {
  const { continueAsGuest } = useAuth();

  const onGuest = async () => {
    await continueAsGuest();
    // replace so user cannot go back to Welcome
    navigation.replace("MainTabs");
  };

  const onAuth = () => {
    // go to the auth stack (Login / Register)
    navigation.navigate("Auth", { screen: "Login" });
  };

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Image source={require("../assets/icon.png")} style={styles.logo} />
        <Text style={styles.title}>Welcome to SmartDesk</Text>
        <Text style={styles.subtitle}>Your IT support assistant</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={onGuest}>
          <Text style={styles.primaryText}>Continue as guest</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ghostBtn} onPress={onAuth}>
          <Text style={styles.ghostText}>Log in or create an account</Text>
        </TouchableOpacity>

        <Text style={styles.tapText}>Tap a button to continue</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3498db",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  centerContent: {
    alignItems: "center",
    marginTop: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 18,
    borderRadius: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
  },
  actions: {
    width: "100%",
    alignItems: "center",
  },
  primaryBtn: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryText: {
    color: "#3498db",
    fontWeight: "800",
    fontSize: 16,
  },
  ghostBtn: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 18,
  },
  ghostText: {
    color: "rgba(255,255,255,0.95)",
    fontWeight: "600",
  },
  tapText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    marginTop: 8,
  },
});