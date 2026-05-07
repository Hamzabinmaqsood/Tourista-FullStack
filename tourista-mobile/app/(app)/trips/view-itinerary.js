// In app/(app)/trips/view-itinerary.js (FINAL, WORKING VERSION)
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { COLORS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../src/services/api';

// Reusable component for a single activity within a day
const ActivityCard = ({ item }) => (
  <View style={styles.activityCard}>
    <View style={styles.timeBadge}>
      <Text style={styles.timeText}>{item.time}</Text>
    </View>
    <View style={styles.activityContent}>
      <Text style={styles.activityTitle}>{item.activity}</Text>
      <Text style={styles.activityDescription}>{item.description}</Text>
    </View>
  </View>
);

export default function ViewItineraryScreen() {
  const router = useRouter();
  const { itinerary: itineraryString } = useLocalSearchParams();
  const [isSaving, setIsSaving] = useState(false); // Add loading state for the save button

  const itinerary = useMemo(() => {
    try { return JSON.parse(itineraryString); } 
    catch (e) { return null; }
  }, [itineraryString]);

  const handleSaveItinerary = async () => {
    // THIS IS THE FIX: We ensure the correct 'itinerary' object is used
    // and we add a loading state to prevent multiple clicks.
    if (!itinerary) {
      Alert.alert("Error", "Itinerary data is corrupted.");
      return;
    }
    setIsSaving(true);
    try {
      await api.post('/api/planner/save-ai-itinerary/', itinerary);
      Alert.alert(
        "Trip Saved!", 
        "Your new plan is now in 'My Trips'.",
        [{ text: "OK", onPress: () => router.replace('/trips') }]
      );
    } catch (error) {
      console.error("Failed to save AI itinerary:", error.response?.data || error);
      Alert.alert("Save Failed", "There was an error saving this itinerary.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!itinerary) {
    return <Text style={styles.errorText}>Could not display the generated itinerary.</Text>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Trip to ${itinerary.destination}` }} />
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Your AI-Generated Plan</Text>
          <Text style={styles.subtitle}>{itinerary.duration} in {itinerary.destination}</Text>
        </View>

        {itinerary.daily_plan.map(day => (
          <View key={day.day} style={styles.dayContainer}>
            <Text style={styles.dayHeader}>Day {day.day}: {day.title}</Text>
            {day.activities.map((activity, index) => (
              <ActivityCard key={index} item={activity} />
            ))}
          </View>
        ))}
      </ScrollView>


      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && { backgroundColor: COLORS.textSecondary }]} 
          onPress={handleSaveItinerary}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="bookmark-outline" size={24} color="#fff" />
              <Text style={styles.saveButtonText}>Save to My Trips</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  errorText: { textAlign: 'center', marginTop: 50 },
  header: { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 5 },
  dayContainer: { margin: 15 },
  dayHeader: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginBottom: 15 },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  timeBadge: { backgroundColor: COLORS.secondary + '20', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, marginRight: 15, alignSelf: 'flex-start' },
  timeText: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 12 },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  activityDescription: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: COLORS.card },
  saveButton: { flexDirection: 'row', backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});