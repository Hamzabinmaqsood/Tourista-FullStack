// In app/(app)/home/ai-chat.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../../../src/services/api';
import { COLORS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.aiMessageContainer]}>
      <Text style={isUser ? styles.userMessageText : styles.aiMessageText}>
        {message.content}
      </Text>
    </View>
  );
};
const AI_PROMPTS = [
  "Where should I go with my family?",
  "Show me hidden gems in AJK.",
  "Suggest a budget-friendly trek.",
  "What's famous in Hunza Valley?",
];

const PromptSuggestion = ({ prompt, onPress }) => (
  <TouchableOpacity style={styles.promptChip} onPress={() => onPress(prompt)}>
    <Text style={styles.promptChipText}>{prompt}</Text>
  </TouchableOpacity>
);

export default function AIChatScreen() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am Tourista. How can I help you plan your trip today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef();
  
  // State for rotating prompts
  const [currentPrompts, setCurrentPrompts] = useState([]);

  // This effect shuffles and selects prompts when the screen loads
  useEffect(() => {
    const shuffled = [...AI_PROMPTS].sort(() => 0.5 - Math.random());
    setCurrentPrompts(shuffled.slice(0, 2)); // Show 2 random prompts
  }, []);

  const handleSend = async (promptText = input) => {
    if (!promptText.trim()) return;

    const userMessage = { role: 'user', content: promptText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/planner/ai-chat/', { prompt: promptText });
      const aiMessage = { role: 'ai', content: response.data.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Chat failed:", error.response?.data || error);
      const errorMessage = { role: 'ai', content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment." };
      setMessages(prev => [...prev, errorMessage]);
    }
    finally { setIsLoading(false); }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen options={{ title: 'Tourista AI Assistant' }} />
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={{ paddingVertical: 10, flexGrow: 1 }}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, index) => <ChatMessage key={index} message={msg} />)}
        {isLoading && <ActivityIndicator size="small" color={COLORS.primary} style={styles.typingIndicator} />}
        
        {/* THIS IS THE FIX: Show prompts only at the start of the chat */}
        {messages.length <= 1 && !isLoading && (
          <View style={styles.promptsContainer}>
            <Text style={styles.promptsTitle}>Try asking...</Text>
            {currentPrompts.map(prompt => (
              <PromptSuggestion key={prompt} prompt={prompt} onPress={handleSend} />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about destinations, activities..."
          editable={!isLoading}
        />
      <TouchableOpacity style={styles.sendButton} onPress={() => handleSend(input)} disabled={isLoading || !input.trim()}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  chatContainer: { flex: 1 },
  // Message Styles
  messageContainer: { maxWidth: '80%', borderRadius: 15, padding: 15, marginBottom: 10 },
  userMessageContainer: { alignSelf: 'flex-end', backgroundColor: COLORS.primary, marginRight: 10 },
  aiMessageContainer: { alignSelf: 'flex-start', backgroundColor: COLORS.card, marginLeft: 10, borderWidth: 1, borderColor: '#eee' },
  userMessageText: { color: '#fff', fontSize: 16 },
  aiMessageText: { color: COLORS.text, fontSize: 16 },
  // Input Styles
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: '#ddd', backgroundColor: COLORS.card },
  textInput: { flex: 1, height: 40, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 15, marginRight: 10 },
  sendButton: { backgroundColor: COLORS.primary, padding: 10, borderRadius: 25 },


  typingIndicator: { alignSelf: 'flex-start', marginLeft: 20, marginTop: 10 },
  promptsContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 15,
  },
  promptsTitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  promptChip: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  promptChipText: {
    color: COLORS.text,
    fontSize: 14,
  },
});