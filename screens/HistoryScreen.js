//==================================
// IMPORTS
//==================================
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { getChatHistory } from "../storage/chatStorage";

//==================================
// HISTORY SCREEN
//==================================
export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const navigation = useNavigation();

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getChatHistory();
    setHistory(data);
  };

  const renderItem = ({ item }) => {
    const firstUserMessage =
      item.messages.find((m) => m.sender === "user")?.text ||
      "Conversation";

    const date = new Date(item.createdAt).toLocaleDateString();

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate("Conversation", { session: item })
        }
      >
        <Text style={styles.preview}>{firstUserMessage}</Text>
        <Text style={styles.date}>{date}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No chat history yet</Text>
            <Text style={styles.emptyText}>
              Your past support conversations will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

//==================================
// STYLES
//==================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fb",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  preview: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 6,
  },

  date: {
    fontSize: 12,
    color: "#6b7280",
  },

  emptyState: {
    marginTop: 80,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
    color: "#374151",
  },

  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    maxWidth: 260,
  },
});
