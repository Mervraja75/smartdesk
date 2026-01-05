//==================================
// IMPORTS
//==================================
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

//==================================
// CONVERSATION SCREEN (READ-ONLY)
//==================================
export default function ConversationScreen({ route }) {
  const { session } = route.params;

  return (
    <View style={styles.container}>
      <FlatList
        data={session.messages}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.sender === "user"
                ? styles.userBubble
                : styles.aiBubble,
            ]}
          >
            <Text
              style={
                item.sender === "user"
                  ? styles.userText
                  : styles.aiText
              }
            >
              {item.text}
            </Text>
          </View>
        )}
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

  bubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 14,
    marginVertical: 6,
  },

  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#3498db",
  },

  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#ecf0f1",
  },

  userText: { color: "#fff", fontSize: 15 },
  aiText: { color: "#2c3e50", fontSize: 15 },
});
