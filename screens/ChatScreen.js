//==================================
// CHAT SCREEN
//==================================
export default function ChatScreen({ route, navigation }) {
  // --- STATE ---
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Live session info
  const sessionIdRef = useRef(Date.now().toString());
  const sessionCreatedAtRef = useRef(Date.now());

  // Prefill guards
  const lastPrefillRef = useRef("");
  const autoSendPrefillRef = useRef(false); // ✅ NEW

  //==================================
  // PREFILL FROM CATEGORY / DEVICES
  //==================================
  useEffect(() => {
    const prefill = route?.params?.prefill;

    if (typeof prefill === "string" && prefill.trim()) {
      if (lastPrefillRef.current !== prefill) {
        lastPrefillRef.current = prefill;
        setInput(prefill);

        // ✅ Auto-send ONCE
        if (!autoSendPrefillRef.current) {
          autoSendPrefillRef.current = true;
          setTimeout(() => sendMessage(prefill), 300);
        }

        // Clear param so it won’t re-trigger
        navigation?.setParams?.({ prefill: undefined });
      }
    }
  }, [route?.params?.prefill]);

  //==================================
  // CORE SEND LOGIC
  //==================================
  const sendMessage = (text) => {
    if (!text.trim() || isTyping) return;

    // Reset auto-send guard after first use
    autoSendPrefillRef.current = false;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    const userMsg = createMessage(text, "user");

    setMessages((prev) => {
      const updated = [...prev, userMsg];
      animateMessage(userMsg, { fade: 220, slide: 260 });
      persistLiveSession(updated);
      return updated;
    });

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
        aiText = await fetchAIReply(text, historySnapshot);
      } catch (e) {
        aiText =
          "AI is unavailable right now — using Smart Replies.\n\n" +
          getReply(text);
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

  // (rest of your file stays EXACTLY the same)
}