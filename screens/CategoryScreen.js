// screens/CategoryScreen.js
import React, { useMemo } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";

/*
  Navigation logic:
  - Devices  -> Laptops / Printers / Monitors
  - Laptops  -> Mac / Windows
  - Mac / Windows -> leaf issues -> deep-link to Chat with prefill
*/

// Top-level Devices list
const DEVICE_SUBCATEGORIES = ["Laptops", "Printers", "Monitors"];

// If a category has further subcategories (e.g. Laptops -> Mac/Windows)
const SUBCATEGORY_MAP = {
  Laptops: ["Mac", "Windows"],
};

// Leaf issues for actual troubleshooting options
const ISSUE_MAP = {
  // Laptops leafs are split under Mac / Windows
  Mac: [
    "Battery not charging",
    "Won't power on",
    "Slow performance",
    "Wi-Fi not connecting",
    "No sound / audio issues",
    "Screen is flickering / black",
  ],
  Windows: [
    "Battery not charging",
    "Won't boot / Blue screen",
    "Slow performance / high CPU",
    "Wi-Fi not connecting",
    "No sound / audio issues",
    "Display driver issues / flicker",
  ],

  // Printers & Monitors remain leaf categories
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

  // Decide which list to show:
  // 1) If caller passed items, use them (explicit)
  // 2) If top-level Devices, show DEVICE_SUBCATEGORIES
  // 3) If current title has subcategories, show them
  // 4) If current title has leaf issues, show them
  const items = useMemo(() => {
    if (Array.isArray(passedItems) && passedItems.length > 0) return passedItems;
    if (title === "Devices") return DEVICE_SUBCATEGORIES;
    if (SUBCATEGORY_MAP[title]) return SUBCATEGORY_MAP[title];
    if (ISSUE_MAP[title]) return ISSUE_MAP[title];
    return [];
  }, [title, passedItems]);

  // Safe attempt to navigate to Chat tab and pass a prefill param.
  // CategoryScreen lives inside the SmartDesk stack, which is a child of the Tab navigator.
  // navigation.getParent() should return the Tab navigator.
  const goToChatTab = (prefill) => {
    const tabParent = navigation.getParent?.();
    if (tabParent && typeof tabParent.navigate === "function") {
      // Navigate to the Chat tab and pass params
      tabParent.navigate("Chat", { prefill });
    } else {
      // Fallback (should rarely be used)
      navigation.navigate("Chat", { prefill });
    }
  };

  const handleSelect = (item) => {
    // If this item itself has subcategories (e.g., Laptops -> Mac/Windows) go deeper
    if (SUBCATEGORY_MAP[item]) {
      navigation.navigate("Category", {
        title: item,
        items: SUBCATEGORY_MAP[item],
      });
      return;
    }

    // If the item is a known leaf that has issues (ISSUE_MAP key), show those issues
    if (ISSUE_MAP[item]) {
      navigation.navigate("Category", {
        title: item,
        items: ISSUE_MAP[item],
      });
      return;
    }

    // Otherwise treat it as a real issue (leaf) and deep-link to Chat with prefill
    const prefill = `I am having an issue with ${title}: ${item}. Please help me troubleshoot step-by-step.`;
    goToChatTab(prefill);
  };

  const renderItem = ({ item }) => {
    const isSubcategory = !!SUBCATEGORY_MAP[item];
    const isCategoryWithIssues = !!ISSUE_MAP[item] && !isSubcategory;
    const hint = isSubcategory
      ? "View subcategories"
      : isCategoryWithIssues
      ? "View common issues"
      : "Tap to get help";

    return (
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.85}
        onPress={() => handleSelect(item)}
      >
        <Text style={styles.itemTitle}>{item}</Text>
        <Text style={styles.itemHint}>{hint}</Text>
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