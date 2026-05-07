// In app/(app)/trips/add.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../../src/services/api';
import { COLORS } from '../../../constants/theme';

export default function AddItineraryScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // A simple date validation (YYYY-MM-DD format)
  const isValidDate = (dateString) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  };

  const handleCreateTrip = async () => {
    if (!name || !startDate || !endDate) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      Alert.alert("Invalid Date Format", "Please use YYYY-MM-DD format for dates.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/api/planner/itineraries/', {
        name: name,
        start_date: startDate,
        end_date: endDate,
      });
      
      Alert.alert("Success", "Your new trip has been created!", [
        { text: "OK", onPress: () => router.back() }
      ]);

    } catch (error) {
      console.error("Failed to create itinerary:", error.response?.data || error);
      Alert.alert("Creation Failed", "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plan a New Trip</Text>
      
      <Text style={styles.label}>Trip Name</Text>
      <TextInput style={styles.input} placeholder="e.g., Summer Adventure in Skardu" value={name} onChangeText={setName} />
      
      <Text style={styles.label}>Start Date</Text>
      <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={startDate} onChangeText={setStartDate} />

      <Text style={styles.label}>End Date</Text>
      <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={endDate} onChangeText={setEndDate} />
      
      <TouchableOpacity style={styles.button} onPress={handleCreateTrip} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? "Creating..." : "Create Trip"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 30 },
  label: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 8 },
  input: { backgroundColor: COLORS.card, borderRadius: 8, padding: 15, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 20 },
  button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});