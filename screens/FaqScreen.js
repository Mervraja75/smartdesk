// FaqScreen.js
import React, { useState } from 'react'; // useState: lets screen remember what user types
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { faqData } from '../data/faqData'; // import local FAQ database

export default function FaqScreen() {
  const [searchText, setSearchText] = useState(''); // store the search text
  const [expandedId, setExpandedId] = useState(null); // which FAQ is open

  // Toggle Logic (open/close an FAQ card)
  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Filter FAQs based on user input
  const filteredData = faqData.filter((item) =>
    item.question.toLowerCase().includes(searchText.toLowerCase())
  );

  // 🧠 Debugging logs — now correctly placed INSIDE the component
  console.log('Search text:', searchText);
  console.log('Results:', filteredData.length);

  // Tappable + conditional answer
  const renderItem = ({ item }) => {
    const isOpen = expandedId === item.id;
    return (
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => toggleExpand(item.id)} 
          accessibilityRole="button"
          accessibilityState={{ expanded: isOpen }}
          style={styles.row}
        >
          <View style ={styles.chevronBox}>
            <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
          </View>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.answerBox}>
            <Text style={styles.answer}>{item.answer}</Text>
            <Text style={styles.category}>Category: {item.category}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SmartDesk FAQs</Text>

      {/* Search bar for filtering questions */}
      <TextInput
        style={styles.searchBox}
        placeholder="Search your issue..."
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* Display filtered list of FAQs */}
      <FlatList
        data={filteredData} // show only matching questions
        renderItem={renderItem} // ✅ fixed capitalization: was renderitem
        keyExtractor={(item) => item.id.toString()} // unique ID
        ListEmptyComponent={
          <Text style={styles.noResults}>No results found.</Text>
        }
      />
    </View>
  );
}

// 💅 Style section
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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden', //keeps the arrow inside the rounded circle
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  question: {
    flex: 1, //lets the text wrap and not push the arrow out
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginRight: 8, 
  },
  chevronBox: {
  width: 28,                 // fixed width so it stays inside the card
  alignItems: 'center',
  justifyContent: 'center',
  },
  chevron: {
    fontSize: 16,
    color: '#34495e',
  },
  answerBox: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 8,
  },
  answer: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  noResults: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    marginTop: 20,
  },
});