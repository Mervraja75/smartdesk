//==================================
// IMPORTS
//==================================
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SwipeListView } from "react-native-swipe-list-view";

import {
  getChatHistory,
  deleteHistorySession,
} from "../storage/chatStorage";

//==================================
// HISTORY SCREEN
//==================================
export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const navigation = useNavigation();

  const loadHistory = async () => {
    const data = await getChatHistory();
    setHistory(data);
  };

  // Reload history whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const confirmDelete = (sessionId) => {
    Alert.alert(
      "Delete this chat?",
      "This conversation will be permanently removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // Optimistic update
            setHistory((prev) => prev.filter((s) => s.id !== sessionId));
            await deleteHistorySession(sessionId);
          },
        },
      ]
    );
  };

  // Front view (normal card)
  const renderItem = ({ item }) => {
    const firstUserMessage =
      item.messages.find((m) => m.sender === "user")?.text || "Conversation";

    const date = new Date(item.createdAt).toLocaleDateString();

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("Conversation", { session: item })}
      >
        <Text style={styles.preview} numberOfLines={2}>
          {firstUserMessage}
        </Text>
        <Text style={styles.date}>{date}</Text>
      </TouchableOpacity>
    );
  };

  // Back view (revealed on swipe)
  const renderHiddenItem = ({ item }) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDelete(item.id)}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <SwipeListView
        data={history}
        keyExtractor={(item, index) => String(item?.id ?? `${item?.createdAt ?? "no-date"}-${index}`)}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-90}
        disableRightSwipe
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

  rowBack: {
    alignItems: "center",
    backgroundColor: "#ef4444",
    flex: 1,
    marginBottom: 12,
    borderRadius: 12,
    justifyContent: "flex-end",
    flexDirection: "row",
    overflow: "hidden",
  },

  deleteButton: {
    width: 90,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
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