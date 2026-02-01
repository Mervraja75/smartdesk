// screens/ChatScreen.js
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
  AppState,
} from "react-native";

import { getReply } from "../logic/smartReplies";

// ✅ UPDATED STORAGE FUNCTIONS
import {
  getCurrentSession,
  saveCurrentSession,
  finalizeCurrentSession,
  clearCurrentSession,
} from "../storage/chatStorage";

//==================================
// AI BACKEND URL (IMPORTANT)
//==================================
const AI_URL = "https://smartdesk-backend-4th1.onrender.com/chat";

//==================================
// CHAT SCREEN
//==================================
export default function ChatScreen({ route, navigation }) {
  // --- STATE ---
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // ✅ Auto-growing input height
  const MIN_INPUT_HEIGHT = 42;
  const MAX_INPUT_HEIGHT = 140;
  const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);

  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Live session info
  const sessionIdRef = useRef(Date.now().toString());
  const sessionCreatedAtRef = useRef(Date.now());

  // ✅ Prefill guards
  const lastPrefillRef = useRef("");
  const autoSendPrefillRef = useRef(false);

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
  // ✅ PREFILL FROM CATEGORY / DEVICES (auto-send once + clear reliably)
  //==================================
  useEffect(() => {
    const prefill = route?.params?.prefill;

    if (typeof prefill === "string" && prefill.trim()) {
      if (lastPrefillRef.current !== prefill) {
        lastPrefillRef.current = prefill;

        // Show it briefly in the input
        setInput(prefill);

        // ✅ Auto-send ONCE (and clear input after sending)
        if (!autoSendPrefillRef.current) {
          autoSendPrefillRef.current = true;

          setTimeout(() => {
            sendMessage(prefill, true);
            navigation?.setParams?.({ prefill: undefined });
          }, 300);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.params?.prefill]);

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
  }, [isTyping, typingOpacity]);

  //==================================
  // MESSAGE FACTORY
  //==================================
  const createMessage = (text, sender) => ({
    id: Date.now().toString() + Math.random().toString(16).slice(2),
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
  // SAVE LIVE SESSION (NOT HISTORY)
  //==================================
  const persistLiveSession = async (nextMessages) => {
    try {
      const payload = {
        id: sessionIdRef.current,
        createdAt: sessionCreatedAtRef.current,
        messages: nextMessages.map((m) => ({
          sender: m.sender,
          text: m.text,
        })),
      };
      await saveCurrentSession(payload);
    } catch (e) {
      console.log("Failed to persist live session:", e?.message || e);
    }
  };

  //==================================
  // LOAD LIVE SESSION ON MOUNT
  //==================================
  useEffect(() => {
    (async () => {
      const session = await getCurrentSession();
      if (session?.messages?.length) {
        sessionIdRef.current = session.id || Date.now().toString();
        sessionCreatedAtRef.current = session.createdAt || Date.now();

        const restored = session.messages.map((m) => ({
          id: Date.now().toString() + Math.random().toString(16).slice(2),
          text: m.text,
          sender: m.sender,
          animation: {
            opacity: new Animated.Value(1),
            translateY: new Animated.Value(0),
            scale: new Animated.Value(1),
          },
        }));
        setMessages(restored);
      }
    })();
  }, []);

  //==================================
  // FINALIZE WHEN APP CLOSES / BACKGROUNDS
  //==================================
  useEffect(() => {
    const sub = AppState.addEventListener("change", async (nextState) => {
      if (nextState === "background" || nextState === "inactive") {
        await finalizeCurrentSession();
      }
    });

    return () => sub.remove();
  }, []);

  //==================================
  // AI FETCH
  //==================================
  const fetchAIReply = async (text, history) => {
    const payloadHistory = (history || []).slice(-8).map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: payloadHistory }),
        signal: controller.signal,
      });

      const raw = await res.text();

      if (raw.trim().startsWith("<")) {
        throw new Error(`Backend returned HTML. Status ${res.status}`);
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`Backend did not return JSON. Raw: ${raw.slice(0, 120)}`);
      }

      if (!res.ok) {
        throw new Error(data?.error || `AI request failed (${res.status})`);
      }

      return data.reply;
    } finally {
      clearTimeout(timeout);
    }
  };

  //==================================
  // CORE SEND LOGIC
  //==================================
  const sendMessage = (text, clearInputAfterSend = false) => {
    const clean = String(text || "").trim();
    if (!clean || isTyping) return;

    autoSendPrefillRef.current = false;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    const userMsg = createMessage(clean, "user");

    setMessages((prev) => {
      const updated = [...prev, userMsg];
      animateMessage(userMsg, { fade: 220, slide: 260 });
      persistLiveSession(updated);
      return updated;
    });

    // ✅ Clear input immediately if requested (prefill / chip behavior)
    if (clearInputAfterSend) {
      setInput("");
      setInputHeight(MIN_INPUT_HEIGHT);
    }

    setIsTyping(true);

    typingTimeoutRef.current = setTimeout(async () => {
      setIsTyping(false);

      let historySnapshot = [];
      setMessages((prev) => {
        historySnapshot = prev;
        return prev;
      });

      let aiText = "";
      try {
        aiText = await fetchAIReply(clean, historySnapshot);
      } catch (e) {
        aiText =
          "AI is unavailable right now — using Smart Replies.\n\n" +
          getReply(clean);
        console.log("AI fallback:", e?.message || e);
      }

      setMessages((prev) => {
        const aiMsg = createMessage(aiText, "ai");
        const updated = [...prev, aiMsg];
        animateMessage(aiMsg, { fade: 360, slide: 440, delay: 120 });
        persistLiveSession(updated);
        return updated;
      });

      typingTimeoutRef.current = null;
    }, 800);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    // ✅ Clear UI immediately so it doesn't “stay” in the box
    setInput("");
    setInputHeight(MIN_INPUT_HEIGHT);

    sendMessage(text);
  };

  //==================================
  // NEW CHAT
  //==================================
  const clearCurrentChat = () => {
    Alert.alert(
      "Start new chat?",
      "This will end the current conversation and save it to History.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start New",
          style: "destructive",
          onPress: async () => {
            await finalizeCurrentSession();

            setMessages([]);
            setInput("");
            setIsTyping(false);
            setInputHeight(MIN_INPUT_HEIGHT);

            sessionIdRef.current = Date.now().toString();
            sessionCreatedAtRef.current = Date.now();

            await clearCurrentSession();

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
  // SUGGESTION CHIPS
  //==================================
  const suggestions = [
    "Wi-Fi not working",
    "Printer issue",
    "Email setup",
    "Password reset",
    "VPN connection",
  ];

  const handleSuggestionPress = (text) => {
    setInput(text);
    setTimeout(() => sendMessage(text, true), 120);
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
        {messages.length > 0 && (
          <View style={styles.chatControls}>
            <TouchableOpacity onPress={clearCurrentChat}>
              <Text style={styles.clearText}>Start New Chat</Text>
            </TouchableOpacity>
          </View>
        )}

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
                <Text style={item.sender === "user" ? styles.userText : styles.aiText}>
                  {item.text}
                </Text>
              </Animated.View>
            );
          }}
        />

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
            style={[styles.input, { height: Math.max(MIN_INPUT_HEIGHT, inputHeight) }]}
            placeholder="Type your issue…"
            placeholderTextColor="#9ca3af"
            value={input}
            onChangeText={setInput}
            multiline
            textAlignVertical="top"
            scrollEnabled={inputHeight >= MAX_INPUT_HEIGHT}
            underlineColorAndroid="transparent"
            onContentSizeChange={(e) => {
              const h = e.nativeEvent.contentSize.height;
              const clamped = Math.max(MIN_INPUT_HEIGHT, Math.min(MAX_INPUT_HEIGHT, h));
              setInputHeight(clamped);
            }}
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
    alignItems: "flex-end",
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
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