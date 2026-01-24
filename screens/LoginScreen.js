import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { continueAsGuest } = useAuth();

  const onLogin = async () => {
    try {
      if (!email || !password) return Alert.alert("Missing info", "Enter email and password.");
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // No manual navigation needed — AuthContext will switch to MainTabs
    } catch (e) {
      Alert.alert("Login failed", e?.message || "Please try again.");
    }
  };

  const onGuest = async () => {
    await continueAsGuest();
    // No manual navigation needed — RootNavigator will switch to MainTabs
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SmartDesk</Text>
      <Text style={styles.subtitle}>Log in to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.primaryBtn} onPress={onLogin}>
        <Text style={styles.primaryText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={onGuest}>
        <Text style={styles.secondaryText}>Continue as Guest</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Create an account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#f7f9fb" },
  title: { fontSize: 28, fontWeight: "800", textAlign: "center", color: "#2c3e50" },
  subtitle: { fontSize: 14, textAlign: "center", color: "#6b7280", marginBottom: 20 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryBtn: { backgroundColor: "#3498db", padding: 14, borderRadius: 12, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "700" },

  secondaryBtn: {
    marginTop: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryText: { color: "#2c3e50", fontWeight: "700" },

  link: { textAlign: "center", marginTop: 14, color: "#3498db", fontWeight: "600" },
});