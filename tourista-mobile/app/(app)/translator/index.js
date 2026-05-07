// In app/(app)/translator/index.js
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import api from '../../../src/services/api';

const ConversationTurn = ({ person, original, translated }) => (
  <View style={styles.turnContainer}>
    <Text style={styles.personLabel}>{person}</Text>
    <Text style={styles.originalText}>"{original}"</Text>
    <Text style={styles.translatedText}>{translated}</Text>
  </View>
);

export default function TranslatorScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [activeMic, setActiveMic] = useState(null);
  const recordingRef = useRef(null);

  const startRecording = async (person) => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
      }
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setActiveMic(person);
    } catch (err) { console.error('Failed to start recording', err); }
  };

  const stopRecordingAndTranslate = async () => {
    if (!recordingRef.current) return;

    setIsLoading(true);
    const currentPerson = activeMic;
    
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      
      const langA = 'English';
      const langB = 'Urdu';
      const source_lang = currentPerson === 'personA' ? langA : langB;
      const target_lang = currentPerson === 'personA' ? langB : langA;
      
      const formData = new FormData();
      formData.append('audio', { uri, type: 'audio/m4a', name: 'audio.m4a' });
      formData.append('source_lang', source_lang);
      formData.append('target_lang', target_lang);

      const response = await api.post('/api/utils/translate/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const newTurn = {
        id: Date.now(),
        person: currentPerson === 'personA' ? `You (${langA})` : `Vendor (${langB})`,
        original: response.data.transcribed_text,
        translated: response.data.translated_text,
      };
      setConversation(prev => [newTurn, ...prev]);

    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Translation failed. Please try again.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
      setActiveMic(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Live Conversation</Text>
      
      <ScrollView style={styles.conversationHistory}>
        {conversation.length === 0 && !isLoading && (
          <Text style={styles.emptyText}>Press a mic to start the conversation</Text>
        )}
        {conversation.map((turn) => <ConversationTurn key={turn.id} {...turn} />)}
        {isLoading && <ActivityIndicator size="large" color={COLORS.primary} style={{marginVertical: 20}}/>}
      </ScrollView>

      <View style={styles.micContainer}>
        <View style={styles.personContainer}>
          <Text style={styles.personTitle}>You (Tourist)</Text>
          <TouchableOpacity
            style={[styles.micButton, activeMic === 'personA' && styles.micButtonActive]}
            onPressIn={() => startRecording('personA')}
            onPressOut={stopRecordingAndTranslate}
            disabled={isLoading}
          >
            <Ionicons name="mic" size={40} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.personContainer}>
          <Text style={styles.personTitle}>Vendor</Text>
          <TouchableOpacity
            style={[styles.micButton, activeMic === 'personB' && styles.micButtonActive]}
            onPressIn={() => startRecording('personB')}
            onPressOut={stopRecordingAndTranslate}
            disabled={isLoading}
          >
            <Ionicons name="mic" size={40} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', paddingTop: 50, paddingBottom: 10 },
  conversationHistory: { flex: 1 },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, fontSize: 16, marginTop: '40%'},
  micContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: 20, borderTopWidth: 1, borderTopColor: '#ddd', backgroundColor: COLORS.card },
  personContainer: { alignItems: 'center' },
  personTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 15 },
  micButton: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  micButtonActive: { backgroundColor: '#E64A19' },
  turnContainer: { backgroundColor: COLORS.card, borderRadius: 12, padding: 15, marginBottom: 10, marginHorizontal: 10, borderWidth: 1, borderColor: '#eee' },
  personLabel: { fontSize: 14, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 5 },
  originalText: { fontSize: 16, fontStyle: 'italic', color: COLORS.textSecondary, marginBottom: 10 },
  translatedText: { fontSize: 18, fontWeight: '500', color: COLORS.text },
});