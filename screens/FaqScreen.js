// FaqScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { faqData } from '../data/faqData';

// Highlight matched search text inside a string
function HighlightText({ text, query }) {
  if (!query) return <Text>{text}</Text>;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  if (!lowerText.includes(lowerQuery)) {
    return <Text>{text}</Text>;
  }

  const parts = text.split(new RegExp(`(${query})`, 'ig'));

  return (
    <Text>
      {parts.map((part, index) =>
        part.toLowerCase() === lowerQuery ? (
          <Text key={index} style={styles.highlight}>
            {part}
          </Text>
        ) : (
          <Text key={index}>{part}</Text>
        )
      )}
    </Text>
  );
}

export default function FaqScreen() {
  const [searchText, setSearchText] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Single animation value (Day 17)
  const animation = useRef(new Animated.Value(0)).current;

  // Reset accordion when search changes (prevents weird states)
  useEffect(() => {
    setExpandedId(null);
    animation.setValue(0);
  }, [searchText]);

  const toggleExpand = (id) => {
    const isOpening = expandedId !== id;
    setExpandedId(isOpening ? id : null);

    Animated.timing(animation, {
      toValue: isOpening ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  };

  const filteredData = faqData.filter((item) => {
    const q = searchText.toLowerCase();
    return (
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const renderItem = ({ item }) => {
    const isOpen = expandedId === item.id;

    const rotate = animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    const height = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 90],
    });

    return (
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => toggleExpand(item.id)}
          style={styles.row}
        >
          <Text style={styles.question}>
            <HighlightText text={item.question} query={searchText} />
          </Text>

          <Animated.Text
            style={[styles.chevron, { transform: [{ rotate }] }]}
          >
            ▼
          </Animated.Text>
        </TouchableOpacity>

        {isOpen && (
          <Animated.View style={[styles.answerBox, { height }]}>
            <Text style={styles.answer}>
              <HighlightText text={item.answer} query={searchText} />
            </Text>
            <Text style={styles.category}>Category: {item.category}</Text>
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SmartDesk FAQs</Text>

      <TextInput
        style={styles.searchBox}
        placeholder="Search by issue, keyword, or category…"
        value={searchText}
        onChangeText={setSearchText}
        clearButtonMode="while-editing"
      />

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyText}>
              Try a different keyword like “Wi-Fi”, “printer”, or “password”.
            </Text>
          </View>
        }
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
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  searchBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    flex: 1,
    marginRight: 8,
  },
  chevron: {
    fontSize: 16,
    color: '#34495e',
  },
  answerBox: {
    overflow: 'hidden',
    marginTop: 10,
  },
  answer: {
    fontSize: 14,
    color: '#555',
  },
  category: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4,
  },
  highlight: {
    backgroundColor: '#fff3cd',
    color: '#92400e',
    fontWeight: '700',
  },
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#374151',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
