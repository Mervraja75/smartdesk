//==================================
// IMPORTS
//==================================
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Easing,
} from "react-native";

import { getReply } from "../logic/smartReplies";

//==================================
// CHAT SCREEN
//==================================
export default function ChatScreen() {
  // --- STATE ---
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  //==================================
  // AUTO SCROLL
  //==================================
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 40);
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  //==================================
  // TYPING INDICATOR ANIMATION
  //==================================
  const typingOpacity = useRef(new Animated.Value(0.3)).current;
  const typingAnimRef = useRef(null);

  useEffect(() => {
    if (isTyping) {
      typingAnimRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(typingOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(typingOpacity, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      typingAnimRef.current.start();
    } else {
      typingAnimRef.current?.stop();
      typingOpacity.stopAnimation(() => typingOpacity.setValue(0.3));
    }
  }, [isTyping]);

  //==================================
  // MESSAGE FACTORY
  //==================================
  const createMessage = (text, sender) => ({
    id: Date.now().toString(),
    text,
    sender,
    animation: {
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(20),
      scale: new Animated.Value(sender === "user" ? 0.92 : 0.96),
    },
  });

  //==================================
  // MESSAGE ANIMATION
  //==================================
  const animateMessage = (msg, config = {}) => {
    Animated.parallel([
      Animated.timing(msg.animation.opacity, {
        toValue: 1,
        duration: config.fade ?? 300,
        delay: config.delay ?? 0,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(msg.animation.translateY, {
        toValue: 0,
        duration: config.slide ?? 360,
        delay: config.delay ?? 0,
        easing: Easing.out(Easing.back(0.8)),
        useNativeDriver: true,
      }),
      Animated.spring(msg.animation.scale, {
        toValue: 1,
        speed: 12,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start();
  };

  //==================================
  // CORE SEND LOGIC
  //==================================
  const sendMessage = (text) => {
    if (!text.trim() || isTyping) return;

    // Cancel existing typing timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    const userMsg = createMessage(text, "user");
    setMessages((prev) => [...prev, userMsg]);
    animateMessage(userMsg, { fade: 220, slide: 260 });

    setIsTyping(true);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);

      const aiMsg = createMessage(getReply(text), "ai");
      setMessages((prev) => [...prev, aiMsg]);
      animateMessage(aiMsg, {
        fade: 360,
        slide: 440,
        delay: 120,
      });

      typingTimeoutRef.current = null;
    }, 800);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    sendMessage(text);
  };

  //==================================
  // SUGGESTION CHIPS (DAY 6)
  //==================================
  const suggestions = [
    "Wi-Fi not working",
    "Printer issue",
    "Email setup",
    "Password reset",
    "VPN connection",
  ];

  const handleSuggestionPress = (text) => {
    setInput("");
    sendMessage(text);
  };

  //==================================
  // UI
  //==================================
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View style={styles.container}>
        {/* --- SUGGESTION BAR --- */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionBar}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        >
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.suggestionChip,
                isTyping && styles.suggestionDisabled,
              ]}
              onPress={() => handleSuggestionPress(item)}
              disabled={isTyping}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.suggestionText,
                  isTyping && styles.suggestionTextDisabled,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* --- CHAT LIST --- */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          removeClippedSubviews={false}
          onContentSizeChange={scrollToBottom}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 12, paddingBottom: 140 }}
          renderItem={({ item }) => {
            if (!item.animation) return null;
            const { opacity, translateY, scale } = item.animation;

            return (
              <Animated.View
                style={[
                  styles.bubble,
                  item.sender === "user"
                    ? styles.userBubble
                    : styles.aiBubble,
                  { opacity, transform: [{ translateY }, { scale }] },
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
              </Animated.View>
            );
          }}
        />

        {/* --- TYPING INDICATOR --- */}
        {isTyping && (
          <View style={styles.typingRow}>
            <View style={styles.typingAvatar}>
              <Text style={styles.typingAvatarText}>SD</Text>
            </View>
            <Animated.Text
              style={[styles.typingText, { opacity: typingOpacity }]}
            >
              SmartDesk is typing…
            </Animated.Text>
          </View>
        )}

        {/* --- INPUT BAR --- */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your issue…"
            value={input}
            onChangeText={setInput}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { opacity: input.trim() ? 1 : 0.5 },
            ]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

//==================================
// STYLES
//==================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fb" },

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

  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingBottom: 8,
  },

  typingAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#2c3e50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  typingAvatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
  },

  typingText: {
    color: "#6b7280",
    fontSize: 13,
  },

  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    marginRight: 8,
  },

  sendButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },

  sendText: { color: "#fff", fontWeight: "600" },

  suggestionBar: {
    backgroundColor: "#fff",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },

  suggestionChip: {
    backgroundColor: "#eef2ff",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },

  suggestionDisabled: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e5e7eb",
  },

  suggestionText: {
    color: "#1e3a8a",
    fontWeight: "500",
    fontSize: 14,
  },

  suggestionTextDisabled: {
    color: "#9ca3af",
  },
});
