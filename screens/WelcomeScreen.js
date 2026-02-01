import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function WelcomeScreen({ navigation }) {
  const { continueAsGuest } = useAuth();

  const handleGuest = async () => {
    await continueAsGuest();
    navigation.replace("MainTabs"); // goes to SmartDeskHomeScreen
  };

  const handleLogin = () => {
    navigation.navigate("Auth", { screen: "Login" });
  };

  return (
    <View style={styles.container}>
      {/* LOGO + INTRO */}
      <View style={styles.top}>
        <Image
          source={require("../assets/icon.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>SmartDesk</Text>
        <Text style={styles.subtitle}>
          Your campus IT support assistant
        </Text>

        <Text style={styles.description}>
          Get instant help with school-issued devices, software, and accounts —
          no ticket needed for common issues.
        </Text>
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleGuest}>
          <Text style={styles.primaryText}>Continue as Guest</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleLogin}>
          <Text style={styles.secondaryText}>Log in or Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

//==================================
// STYLES
//==================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3498db",
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: "space-between",
  },

  top: {
    alignItems: "center",
    marginTop: 40,
  },

  logo: {
    width: 120,
    height: 120,
    borderRadius: 24,
    marginBottom: 18,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.95)",
    marginBottom: 16,
  },

  description: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 320,
  },

  actions: {
    width: "100%",
  },

  primaryBtn: {
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },

  primaryText: {
    color: "#3498db",
    fontSize: 16,
    fontWeight: "800",
  },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  secondaryText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});