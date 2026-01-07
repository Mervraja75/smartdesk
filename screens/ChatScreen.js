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
  Alert,
} from "react-native";

import { getReply } from "../logic/smartReplies";
import { saveChatSession } from "../storage/chatStorage";

//==================================
// AI BACKEND URL (IMPORTANT)
//==================================
// ❗ On iOS Expo Go (real phone), "localhost" points to your PHONE, not your laptop.
// Replace with your laptop's LAN IP, e.g. "http://192.168.0.12:3001/chat"
const AI_URL = "http://10.250.235.253:3001/chat";

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
  // AI FETCH
  //==================================
  const fetchAIReply = async (text, history) => {
    const payloadHistory = (history || []).slice(-8).map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    const response = await fetch(AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history: payloadHistory }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "AI request failed");
    }

    return data.reply;
  };

  //==================================
  // CORE SEND LOGIC
  //==================================
  const sendMessage = (text) => {
    if (!text.trim() || isTyping) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    const userMsg = createMessage(text, "user");

    setMessages((prev) => {
      const updated = [...prev, userMsg];
      animateMessage(userMsg, { fade: 220, slide: 260 });
      return updated;
    });

    setIsTyping(true);

    typingTimeoutRef.current = setTimeout(async () => {
      setIsTyping(false);

      // We need the latest messages for history; fetch them safely.
      let historySnapshot = [];
      setMessages((prev) => {
        historySnapshot = prev;
        return prev;
      });

      let aiText = "";
      try {
        aiText = await fetchAIReply(text, historySnapshot);
      } catch (e) {
        // Fallback to local smart replies
        aiText =
          "AI is unavailable right now — using Smart Replies.\n\n" + getReply(text);
        console.log("AI fallback:", e?.message || e);
      }

      setMessages((prev) => {
        const aiMsg = createMessage(aiText, "ai");
        const updated = [...prev, aiMsg];

        // ✅ Save completed chat session
        saveChatSession(updated);

        animateMessage(aiMsg, {
          fade: 360,
          slide: 440,
          delay: 120,
        });

        return updated;
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
  // CLEAR CHAT (DAY 25)
  //==================================
  const clearCurrentChat = () => {
    Alert.alert(
      "Start new chat?",
      "This will clear the current conversation. Your history will remain.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            setMessages([]);
            setInput("");
            setIsTyping(false);

            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = null;
            }
          },
        },
      ]
    );
  };

  //==================================
  // SUGGESTION CHIPS (ONBOARDING ONLY)
  //==================================
  const suggestions = [
    "Wi-Fi not working",
    "Printer issue",
    "Email setup",
    "Password reset",
    "VPN connection",
  ];

  const handleSuggestionPress = (text) => {
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
        {/* --- CHAT CONTROLS --- */}
        {messages.length > 0 && (
          <View style={styles.chatControls}>
            <TouchableOpacity onPress={clearCurrentChat}>
              <Text style={styles.clearText}>New Chat</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* --- SUGGESTION CHIPS --- */}
        {messages.length === 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 6 }}
          >
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

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
            const { opacity, translateY, scale } = item.animation;

            return (
              <Animated.View
                style={[
                  styles.bubble,
                  item.sender === "user" ? styles.userBubble : styles.aiBubble,
                  { opacity, transform: [{ translateY }, { scale }] },
                ]}
              >
                <Text
                  style={item.sender === "user" ? styles.userText : styles.aiText}
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
            <Animated.Text style={[styles.typingText, { opacity: typingOpacity }]}>
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
            style={[styles.sendButton, { opacity: input.trim() ? 1 : 0.5 }]}
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

  chatControls: {
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 6,
  },

  clearText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "600",
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

  suggestionChip: {
    backgroundColor: "#eef2ff",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },

  suggestionText: {
    color: "#1e3a8a",
    fontWeight: "500",
    fontSize: 14,
  },
});
