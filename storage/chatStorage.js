import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "SMARTDESK_CHAT_HISTORY";

// Get all saved chats
export async function getChatHistory() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load chat history", error);
    return [];
  }
}

// Save a completed chat session
export async function saveChatSession(messages) {
  try {
    if (!messages.length) return;

    const existing = await getChatHistory();

    const session = {
      id: Date.now().toString(),
      createdAt: Date.now(),
      messages: messages.map(({ sender, text }) => ({ sender, text })),
    };

    const updated = [session, ...existing];

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save chat session", error);
  }
}

// Clear all chat history (future use)
export async function clearChatHistory() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear chat history", error);
  }
}
