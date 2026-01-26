// screens/SmartDeskHomeScreen.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function SmartDeskHomeScreen({ navigation }) {
  // ✅ Deep-link to the Chat TAB (SmartDesk stack is nested inside Tabs)
  const goToChat = () => {
    navigation.getParent()?.navigate("Chat");
  };

  // ✅ Go to CategoryScreen with a list of items
  const goToCategory = (title, items = []) => {
    navigation.navigate("Category", { title, items });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>SmartDesk</Text>
      <Text style={styles.subheading}>Choose a category</Text>

      <View style={styles.grid}>
        {/* DEVICES */}
        <TouchableOpacity
          style={[styles.card, styles.cardDevices]}
          activeOpacity={0.85}
          onPress={() => goToCategory("Devices", ["Laptops", "Printers", "Monitors"])}
        >
          <Text style={styles.cardTitle}>Devices</Text>
          <Text style={styles.cardText}>Laptops, printers, monitors…</Text>
        </TouchableOpacity>

        {/* SOFTWARE (demo placeholder list for now) */}
        <TouchableOpacity
          style={[styles.card, styles.cardSoftware]}
          activeOpacity={0.85}
          onPress={() =>
            goToCategory("Software", ["Email", "VPN", "Zoom", "Microsoft Office"])
          }
        >
          <Text style={styles.cardTitle}>Software</Text>
          <Text style={styles.cardText}>Email, VPN, Zoom, Office…</Text>
        </TouchableOpacity>

        {/* ACCOUNTS (demo placeholder list for now) */}
        <TouchableOpacity
          style={[styles.card, styles.cardAccounts]}
          activeOpacity={0.85}
          onPress={() => goToCategory("Accounts", ["Password reset", "MFA", "Can’t log in"])}
        >
          <Text style={styles.cardTitle}>Accounts</Text>
          <Text style={styles.cardText}>Password reset, MFA, login…</Text>
        </TouchableOpacity>

        {/* OTHER -> Chat */}
        <TouchableOpacity
          style={[styles.card, styles.cardOther]}
          activeOpacity={0.85}
          onPress={goToChat}
        >
          <Text style={styles.cardTitle}>Other</Text>
          <Text style={styles.cardText}>Chat with SmartDesk AI</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fb", padding: 16 },
  heading: { fontSize: 26, fontWeight: "800", color: "#111827", marginTop: 8 },
  subheading: { fontSize: 14, color: "#6b7280", marginTop: 4, marginBottom: 16 },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },

  card: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  cardTitle: { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 6 },
  cardText: { fontSize: 13, color: "#374151", lineHeight: 18 },

  cardDevices: { backgroundColor: "#eef2ff" },
  cardSoftware: { backgroundColor: "#ecfeff" },
  cardAccounts: { backgroundColor: "#ecfdf5" },
  cardOther: { backgroundColor: "#fff7ed" },
});