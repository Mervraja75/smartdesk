//Part 1: Import tools from React Native
import React from 'react'
import { View, Text, Button, StyleSheet } from 'react-native';

//Part 2: Create HomeScreen component
export default function HomeScreen({ navigation }) { //defines a screen React will display
    return(
        <View style={styles.container}>
            <Text style={styles.title}>SmartDesk</Text> 
            <Text style={styles.subtitle}> Your AI IT Assistant</Text>

            <Button //Takes us to other screens when tapped
            title="Ask AI Assistant"
            onPress={() =>navigation.navigate('Chat')} //Chat: moves to Chat screen
            />

            <Button
            title="Browse FAQs"
            onPress={() =>navigation.navigate('FAQ')} //FAQ: moves to FAQ screen
            />
        </View> //View: main container
    );
}

// Part 3: Style the screen
const styles = StyleSheet.create({
  container: {
    flex: 1, // take full height of the screen
    justifyContent: 'center', // center vertically
    alignItems: 'center', // center horizontally
    gap: 16, // spacing between elements
    backgroundColor: '#f9f9f9', // light background
  },
  title: {
    fontSize: 32, // large font for app name
    fontWeight: 'bold', // make it bold
    color: '#2c3e50', // dark blue-gray
  },
  subtitle: {
    fontSize: 16, // smaller text under title
    color: '#7f8c8d', // grayish text
    marginBottom: 20, // spacing below subtitle
  },
});
