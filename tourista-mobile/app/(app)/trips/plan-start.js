// In app/(app)/plan/index.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function PlanTripStartScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Let's Plan Your Next Adventure</Text>
      <Text style={styles.subtitle}>How would you like to start?</Text>

      {/* Scenario 2 Button */}
      <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/plan/recommend')} >
        <Ionicons name="sparkles-outline" size={40} color={COLORS.primary} />
        <Text style={styles.optionTitle}>I'm not sure where to go</Text>
        <Text style={styles.optionDescription}>Get personalized destination recommendations from our AI.</Text>
      </TouchableOpacity>

      <TouchableOpacity 
  style={styles.optionCard}
  onPress={() => router.push('/plan/select-destination')} // This is the change
>
  <Ionicons name="flag-outline" size={40} color={COLORS.primary} />
  <Text style={styles.optionTitle}>I already know my destination</Text>
  <Text style={styles.optionDescription}>Let's build a detailed, day-by-day plan for your trip.</Text>
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: COLORS.background },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: 15 },
  subtitle: { fontSize: 18, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 40 },
  optionCard: {
    backgroundColor: COLORS.card,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  optionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginTop: 15 },
  optionDescription: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 5 },
});