import AsyncStorage from "@react-native-async-storage/async-storage";

// Keys
const HISTORY_KEY = "SMARTDESK_CHAT_HISTORY";
const CURRENT_SESSION_KEY = "SMARTDESK_CURRENT_SESSION";

//==================================
// HISTORY
//==================================
export async function getChatHistory() {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load chat history", error);
    return [];
  }
}

async function setChatHistory(history) {
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

// ✅ Delete ONE session from history
export async function deleteHistorySession(sessionId) {
  try {
    const history = await getChatHistory();
    const updated = history.filter((s) => s.id !== sessionId);
    await setChatHistory(updated);
    return updated;
  } catch (error) {
    console.error("Failed to delete history session", error);
    return null;
  }
}

//==================================
// CURRENT LIVE SESSION
//==================================
export async function getCurrentSession() {
  try {
    const data = await AsyncStorage.getItem(CURRENT_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to load current session", error);
    return null;
  }
}

export async function saveCurrentSession(session) {
  try {
    await AsyncStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Failed to save current session", error);
  }
}

export async function clearCurrentSession() {
  try {
    await AsyncStorage.removeItem(CURRENT_SESSION_KEY);
  } catch (error) {
    console.error("Failed to clear current session", error);
  }
}

//==================================
// FINALIZE SESSION → SAVE TO HISTORY
// (Called when app closes or user starts new chat)
//==================================
export async function finalizeCurrentSession() {
  try {
    const current = await getCurrentSession();

    if (!current || !current.messages || current.messages.length === 0) {
      return;
    }

    const history = await getChatHistory();

    const session = {
      id: current.id || Date.now().toString(),
      createdAt: current.createdAt || Date.now(),
      messages: current.messages,
    };

    await setChatHistory([session, ...history]);
    await clearCurrentSession();
  } catch (error) {
    console.error("Failed to finalize chat session", error);
  }
}

//==================================
// CLEAR ALL HISTORY (OPTIONAL)
//==================================
export async function clearChatHistory() {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear chat history", error);
  }
}