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

  // --- AUTO SCROLL ---
  const scrollToBottom = () => {
    // Prevent Android crashes by delaying frame
    requestAnimationFrame(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- TYPING ANIMATION ---
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
      if (typingAnimRef.current) typingAnimRef.current.stop();
      typingOpacity.stopAnimation(() => typingOpacity.setValue(0.3));
    }
  }, [isTyping]);


  //==================================
  // SEND MESSAGE
  //==================================
  const handleSend = () => {
    if (!input.trim()) return;

    const text = input.trim();
    setInput("");

    // --- USER ANIMATION VALUES ---
    const userFade = new Animated.Value(0);
    const userSlide = new Animated.Value(20);
    const userScale = new Animated.Value(0.8);

    const newUserMessage = {
      id: Date.now(),
      text: text,
      sender: "user",
      opacity: userFade,
      translateY: userSlide,
      scale: userScale,
    };

    setMessages((prev) => [...prev, newUserMessage]);

    // USER animation
    Animated.parallel([
      Animated.timing(userFade, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(userSlide, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.spring(userScale, {
        toValue: 1,
        speed: 12,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Start "typing"
    setIsTyping(true);

    // Prevent double replies
    const aiDelay = setTimeout(() => {
      setIsTyping(false);

      // --- AI ANIMATION VALUES ---
      const aiFade = new Animated.Value(0);
      const aiSlide = new Animated.Value(20);
      const aiScale = new Animated.Value(0.95);

      const newAIMessage = {
        id: Date.now() + 1,
        text: getReply(text),
        sender: "ai",
        opacity: aiFade,
        translateY: aiSlide,
        scale: aiScale,
      };

      setMessages((prev) => [...prev, newAIMessage]);

      // AI animation
      Animated.parallel([
        Animated.timing(aiFade, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(aiSlide, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(Easing.poly(4)),
          useNativeDriver: true,
        }),
        Animated.timing(aiScale, {
          toValue: 1,
          duration: 330,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();

    }, 800);

    return () => clearTimeout(aiDelay);
  };


  //==================================
  // QUICK SUGGESTIONS
  //==================================
  const suggestions = [
    "Wi-Fi not working",
    "Printer issue",
    "Email setup",
    "Password reset",
    "VPN connection",
  ];

  const handleSuggestion = (text) => setInput(text);


  //==================================
  // UI
  //==================================
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.container}>

        {/* --- SUGGESTION ROW --- */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionBar}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        >
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionChip}
              onPress={() => handleSuggestion(item)}
            >
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* --- CHAT LIST --- */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
          renderItem={({ item }) => {
            const opacity = item.opacity || new Animated.Value(1);
            const translateY = item.translateY || new Animated.Value(0);
            const scale = item.scale || new Animated.Value(1);

            return (
              <Animated.View
                style={[
                  styles.bubble,
                  item.sender === "user" ? styles.userBubble : styles.aiBubble,
                  {
                    opacity: opacity,
                    transform: [
                      { translateY: translateY },
                      { scale: scale },
                    ],
                  },
                ]}
              >
                <Text
                  style={
                    item.sender === "user" ? styles.userText : styles.aiText
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
    paddingHorizontal: 12,
    paddingVertical: 6,
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