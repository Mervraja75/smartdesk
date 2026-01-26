// screens/CategoryScreen.js
import React, { useMemo } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";

// ✅ Phase 1: Devices → (Laptops / Printers / Monitors)
const DEVICE_SUBCATEGORIES = ["Laptops", "Printers", "Monitors"];

// ✅ Issues lists (demo)
const ISSUE_MAP = {
  Laptops: [
    "Battery not charging",
    "Won't power on",
    "Slow performance",
    "Wi-Fi not connecting",
    "No sound / audio issues",
    "Screen is flickering / black",
  ],
  Printers: [
    "Printer offline",
    "Paper jam",
    "Can't print from my laptop",
    "Print quality is bad (streaks/blurry)",
    "Toner/Ink low",
  ],
  Monitors: [
    "No signal / black screen",
    "Flickering display",
    "Wrong resolution / scaling",
    "Colors look wrong",
  ],
};

export default function CategoryScreen({ route, navigation }) {
  const title = route?.params?.title || "Category";
  const passedItems = route?.params?.items || [];

  // Decide what to show in the list
  const items = useMemo(() => {
    if (Array.isArray(passedItems) && passedItems.length > 0) return passedItems;
    if (title === "Devices") return DEVICE_SUBCATEGORIES;
    return [];
  }, [title, passedItems]);

  // safe parent-tab navigation to Chat (with fallback)
  const goToChatTab = (prefill) => {
    const parent = navigation.getParent?.();
    if (parent && typeof parent.navigate === "function") {
      // parent is likely the Tab navigator — navigate to Chat tab
      parent.navigate("Chat", { prefill });
    } else {
      // fallback — try to navigate normally
      navigation.navigate("Chat", { prefill });
    }
  };

  const handleSelect = (item) => {
    // If they tapped a subcategory (Laptops/Printers/Monitors), go deeper
    if (ISSUE_MAP[item]) {
      navigation.navigate("Category", {
        title: item,
        items: ISSUE_MAP[item],
      });
      return;
    }

    // Leaf item => send to Chat with prefill
    const prefill = `I am having an issue with ${title}: ${item}. Please help me troubleshoot step-by-step.`;

    goToChatTab(prefill);
  };

  const renderItem = ({ item }) => {
    const isSubcategory = !!ISSUE_MAP[item];

    return (
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.85}
        onPress={() => handleSelect(item)}
      >
        <Text style={styles.itemTitle}>{item}</Text>
        <Text style={styles.itemHint}>
          {isSubcategory ? "View common issues" : "Tap to get help"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        {items.length ? "Select an item" : "No issues available."}
      </Text>

      <FlatList
        data={items}
        keyExtractor={(item, index) => `${title}-${item}-${index}`}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{ paddingBottom: 16 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No issues available.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fb", padding: 16 },
  title: { fontSize: 24, fontWeight: "900", color: "#111827" },
  subtitle: { fontSize: 13, color: "#6b7280", marginTop: 6, marginBottom: 14 },

  item: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  itemTitle: { fontSize: 15, fontWeight: "800", color: "#111827" },
  itemHint: { fontSize: 12, color: "#6b7280", marginTop: 6 },

  empty: { marginTop: 40, alignItems: "center" },
  emptyText: { fontSize: 13, color: "#9ca3af" },
});