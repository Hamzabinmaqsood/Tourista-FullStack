// In app/(app)/messages/[id].js

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../src/services/api';

// --- Reusable Components ---

const ChatMessage = ({ message, isCurrentUser }) => (
  <View style={[styles.messageRow, isCurrentUser ? styles.messageRowRight : styles.messageRowLeft]}>
    {message.attachment ? (
      <Image source={{ uri: message.attachment }} style={styles.attachmentImage} />
    ) : (
      <View style={[styles.messageBubble, isCurrentUser ? styles.userMessageBubble : styles.otherMessageBubble]}>
        <Text style={isCurrentUser ? styles.userMessageText : styles.otherMessageText}>{message.body}</Text>
      </View>
    )}
  </View>
);

// --- Main Screen Component ---

export default function ChatRoomScreen() {
  const { id: conversationId } = useLocalSearchParams();
  const { authState } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversationDetails, setConversationDetails] = useState(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef();

  const fetchMessages = useCallback(async () => {
    try {
      const response = await api.get(`/api/messaging/conversations/${conversationId}/`);
      setMessages(response.data.messages);
      setConversationDetails(response.data);
    } catch (error) { 
      console.error("Failed to fetch messages:", error); 
    } finally { 
      setIsLoading(false); 
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSend = async (messageBody = input, imageUri = null) => {
    if (!messageBody && !imageUri) return;
    setInput('');

    const formData = new FormData();
    if (messageBody) formData.append('body', messageBody);
    if (imageUri) {
      const filename = imageUri.split('/').pop();
      const type = `image/${filename.split('.').pop()}`;
      formData.append('attachment', { uri: imageUri, name: filename, type });
    }

    try {
      await api.post(`/api/messaging/conversations/${conversationId}/messages/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchMessages(); // Refresh the chat to get the new message
    } catch (error) {
      console.error("Failed to send message:", error.response?.data || error);
      alert("Failed to send message.");
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access photos is required!");
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (pickerResult.canceled) return;
    
    // Send the image immediately after picking
    await handleSend(null, pickerResult.assets[0].uri);
  };

  

  const handleBlockUser = async (userToBlock) => {
    try {
      await api.post('/api/moderation/block/', { user_id: userToBlock.id });
      Alert.alert(
        "User Blocked",
        `${userToBlock.username} has been blocked. You will no longer see messages from them.`,
        [{ text: "OK", onPress: () => router.back() }] // Navigate back to the message list
      );
    } catch (error) {
      console.error("Failed to block user:", error.response?.data || error);
      Alert.alert("Error", "Could not block the user at this time.");
    }
  };

  const handleReportUser = async (userToReport, reason) => {
    try {
      await api.post('/api/moderation/report/', {
        reported_user: userToReport.id,
        reason: reason,
      });
      Alert.alert("Report Submitted", "Thank you for your feedback. Our team will review this conversation.");
    } catch (error) {
      console.error("Failed to report user:", error.response?.data || error);
      Alert.alert("Error", "Could not submit report.");
    }
  };

  const showReportOptions = (userToReport) => {
    Alert.alert(
      "Report User",
      `Select a reason for reporting ${userToReport.username}:`,
      [
        { text: "Spam", onPress: () => handleReportUser(userToReport, 'SPAM') },
        { text: "Abuse or Harassment", onPress: () => handleReportUser(userToReport, 'ABUSE') },
        { text: "Scam or Fraud", onPress: () => handleReportUser(userToReport, 'SCAM') },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const showMoreOptions = (userToShowOptionsFor) => {
    Alert.alert(
      "More Options",
      `What would you like to do with ${userToShowOptionsFor.username}?`,
      [
        { text: "Report User", onPress: () => showReportOptions(userToShowOptionsFor) },
        {
          text: "Block User",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Block User?",
              `Are you sure you want to block ${userToShowOptionsFor.username}? This action is permanent.`,
              [
                { text: "Cancel", style: "cancel" },
                { text: "Block", style: "destructive", onPress: () => handleBlockUser(userToShowOptionsFor) }
              ]
            );
          }
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  if (isLoading) return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }}/>;
  if (!conversationDetails) return <Text>Conversation not found.</Text>;
  
  const otherUser = authState.userId === conversationDetails.tourist.id ? conversationDetails.vendor : conversationDetails.tourist;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container} keyboardVerticalOffset={90}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerContainer}>
              <Image 
                // Use optional chaining (?.) to safely access the avatar
                source={otherUser?.profile?.avatar ? { uri: otherUser.profile.avatar } : require('../../../assets/images/default-avatar.png')} 
                style={styles.headerAvatar} 
              />
              <View>
                <Text style={styles.headerTitleText}>{otherUser?.username || 'User'}</Text>
                <View style={styles.headerSubtitleContainer}>
                  <Text style={styles.headerSubtitle} numberOfLines={1}>{conversationDetails?.service?.name}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{conversationDetails?.service?.service_type}</Text>
                  </View>
                </View>
              </View>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 15 }} onPress={() => showMoreOptions(otherUser)}>
              <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text} />
            </TouchableOpacity>
          )
        }}
      />
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <ChatMessage message={item} isCurrentUser={item.sender === authState.userId} />}
        keyExtractor={(item) => item.id.toString()}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={{ paddingVertical: 10 }}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.inputActionButton} onPress={handlePickImage}>
          <Ionicons name="image-outline" size={26} color={COLORS.primary} />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  // Header
  headerContainer: { flexDirection: 'row', alignItems: 'center' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  headerTitleText: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  headerSubtitle: { fontSize: 12, color: COLORS.textSecondary },

  headerSubtitleContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  headerSubtitle: { fontSize: 12, color: COLORS.textSecondary, maxWidth: 150 },
  badge: { backgroundColor: COLORS.secondary + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, marginLeft: 8 },
  badgeText: { color: COLORS.secondary, fontSize: 10, fontWeight: 'bold' },
  // Chat Area
  chatContainer: { flex: 1, paddingHorizontal: 10 },
  messageRow: { flexDirection: 'row', marginVertical: 5 },
  messageRowLeft: { justifyContent: 'flex-start' },
  messageRowRight: { justifyContent: 'flex-end' },
  messageBubble: { borderRadius: 20, paddingVertical: 10, paddingHorizontal: 15, maxWidth: '80%' },
  userMessageBubble: { backgroundColor: COLORS.primary },
  otherMessageBubble: { backgroundColor: COLORS.card },
  userMessageText: { color: '#fff', fontSize: 16 },
  otherMessageText: { color: COLORS.text, fontSize: 16 },
  // Input Bar
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: '#ddd', backgroundColor: COLORS.card },
  textInput: { flex: 1, backgroundColor: '#f0f2f5', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, maxHeight: 100 },
  inputActionButton: { paddingHorizontal: 10 },
  sendButton: { backgroundColor: COLORS.primary, padding: 10, borderRadius: 25, marginLeft: 10 },
  attachmentImage: {
    width: 200,
    height: 200,
    borderRadius: 15,
  },
});
