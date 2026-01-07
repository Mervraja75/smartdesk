import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

export default function WelcomeScreen({ navigation }) {
  const handleContinue = () => {
    navigation.replace("MainTabs"); // replaces welcome so user can’t go back to it
  };

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.9} onPress={handleContinue}>
      <View style={styles.centerContent}>
        <Image source={require("../assets/icon.png")} style={styles.logo} />
        <Text style={styles.title}>Welcome to SmartDesk</Text>
        <Text style={styles.subtitle}>Your IT support assistant</Text>
      </View>

      <Text style={styles.tapText}>Tap to move on</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3498db",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 80,
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
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  tapText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
});
