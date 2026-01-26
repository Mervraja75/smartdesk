// screens/LoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { continueAsGuest } = useAuth();

  const onLogin = async () => {
    const e = String(email || "").trim();
    if (!e || !password) {
      return Alert.alert("Missing info", "Please enter your email and password.");
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, e, password);
      // AuthContext listener will switch to MainTabs automatically.
    } catch (err) {
      console.log("Login error:", err);
      // Friendly error messages for common Firebase errors
      const msg =
        (err?.code === "auth/invalid-email" && "Invalid email address.") ||
        (err?.code === "auth/user-not-found" && "No account found with that email.") ||
        (err?.code === "auth/wrong-password" && "Incorrect password.") ||
        err?.message ||
        "Login failed — please try again.";
      Alert.alert("Login failed", msg);
    } finally {
      setLoading(false);
    }
  };

  const onGuest = async () => {
    setLoading(true);
    try {
      await continueAsGuest();
      // RootNavigator observes isGuest and will show MainTabs.
    } catch (err) {
      console.log("Guest error:", err);
      Alert.alert("Error", "Couldn't continue as guest. Please try again.");
    } finally {
      setLoading(false);
    }
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
        editable={!loading}
        returnKeyType="next"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
        returnKeyType="done"
      />

      <TouchableOpacity
        style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
        onPress={onLogin}
        activeOpacity={0.8}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryText}>Log In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryBtn, loading && { opacity: 0.7 }]}
        onPress={onGuest}
        activeOpacity={0.8}
        disabled={loading}
      >
        <Text style={styles.secondaryText}>Continue as Guest</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")} disabled={loading}>
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