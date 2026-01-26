// screens/DevicesScreen.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function DevicesScreen({ navigation }) {
  const go = (title, items) => {
    navigation.navigate("Category", { title, items });
  };

  const Card = ({ emoji, title, subtitle, onPress }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle} numberOfLines={2}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Devices</Text>
      <Text style={styles.subheading}>Choose a device type</Text>

      <View style={styles.grid}>
        <Card
          emoji="💻"
          title="Laptops"
          subtitle="Wi-Fi, slow performance, login issues"
          onPress={() =>
            go("Laptops", ["Wi-Fi", "Slow / Lag", "Battery / Charging", "Login", "Bluetooth"])
          }
        />

        <Card
          emoji="🖨️"
          title="Printers"
          subtitle="Offline, paper jam, not printing"
          onPress={() =>
            go("Printers", ["Printer Offline", "Paper Jam", "Not Printing", "Low Ink/Toner", "Streaky Prints"])
          }
        />

        <Card
          emoji="🖥️"
          title="Monitors"
          subtitle="No display, flickering, wrong input"
          onPress={() =>
            go("Monitors", ["No Display / No Signal", "Flickering", "Wrong Input", "No Power", "Blurry / Low Resolution"])
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fb", padding: 16 },
  heading: { fontSize: 24, fontWeight: "900", color: "#111827" },
  subheading: { fontSize: 13, color: "#6b7280", marginTop: 6, marginBottom: 14 },

  grid: { gap: 12 },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardEmoji: { fontSize: 22, marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
  cardSubtitle: { marginTop: 6, fontSize: 12, color: "#6b7280", lineHeight: 16 },
});