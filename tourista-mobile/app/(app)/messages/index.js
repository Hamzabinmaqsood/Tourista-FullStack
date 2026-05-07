// In app/(app)/messages/index.js (FINAL, POLISHED VERSION)
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import api from '../../../src/services/api';
import { COLORS } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

// A placeholder function to format dates nicely
const formatTimestamp = (dateString) => {
  const date = new Date(dateString);
  // In a real app, you'd use a library like `date-fns` for this
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// --- NEW, PREMIUM CONVERSATION ITEM COMPONENT ---
const ConversationItem = ({ item, currentUserId, onPress }) => {
  const otherUser = currentUserId === item.tourist.id ? item.vendor : item.tourist;
  const isUnread = !item.is_read; // Assuming you add an 'is_read' field to the Conversation model

  // Placeholder for initials if no avatar
  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?';

  return (
    <TouchableOpacity style={[styles.itemContainer, isUnread && styles.unreadContainer]} onPress={onPress}>
      {/* 1. Profile Images with Placeholders */}
      <View style={styles.avatarContainer}>
        {otherUser.profile.avatar ? (
          <Image source={{ uri: otherUser.profile.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{getInitials(otherUser.username)}</Text>
          </View>
        )}
        {isUnread && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={[styles.itemTitle, isUnread && { fontWeight: 'bold' }]}>{otherUser.username}</Text>
          {/* 4. Timestamp */}
          <Text style={styles.timestamp}>{formatTimestamp(item.updated_at)}</Text>
        </View>
        <Text style={[styles.itemSubtitle, isUnread && { color: COLORS.text }]} numberOfLines={1}>
          Re: {item.service_name}
        </Text>
        {/* 2. Message Preview */}
        <Text style={[styles.itemLastMessage, isUnread && { fontWeight: 'bold', color: COLORS.text }]} numberOfLines={1}>
          {item.last_message || "No messages yet."}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function ChatListScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (authState.authenticated) {
        const fetchConversations = async () => {
          setIsLoading(true);
          try {
            const response = await api.get('/api/messaging/conversations/');
            setConversations(response.data);
          } catch (error) { console.error("Failed to fetch conversations:", error); } 
          finally { setIsLoading(false); }
        };
        fetchConversations();
      }
    }, [authState.authenticated])
  );

  if (isLoading) return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }}/>;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Messages</Text>
      <FlatList
        data={conversations}
        renderItem={({ item }) => <ConversationItem item={item} currentUserId={authState.userId} onPress={() => router.push(`/messages/${item.id}`)} />}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={80} color="#AEB8C4" />
            <Text style={styles.emptyTitle}>No Messages</Text>
            <Text style={styles.emptySubtitle}>Start a conversation with a vendor from a service page.</Text>
          </View>
        }
      />
    </View>
  );
}

// THIS IS THE NEW, PREMIUM STYLESHEET
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.card },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.text, paddingTop: 50, paddingHorizontal: 20, paddingBottom: 10 },
  separator: { height: 1, backgroundColor: '#f0f0f0', marginLeft: 95 },
  itemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 },
  unreadContainer: { backgroundColor: COLORS.primary + '10' }, // Light primary color for unread background
  avatarContainer: { marginRight: 15 },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  avatarPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 24, color: COLORS.textSecondary, fontWeight: 'bold' },
  unreadDot: { position: 'absolute', top: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary, borderWidth: 2, borderColor: COLORS.card },
  textContainer: { flex: 1, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  timestamp: { fontSize: 12, color: COLORS.textSecondary },
  itemSubtitle: { fontSize: 12, color: COLORS.textSecondary, fontStyle: 'italic', marginBottom: 4 },
  itemLastMessage: { fontSize: 14, color: COLORS.textSecondary },
  emptyContainer: { alignItems: 'center', paddingTop: '40%' },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginTop: 20 },
  emptySubtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 40, marginTop: 10 },
});