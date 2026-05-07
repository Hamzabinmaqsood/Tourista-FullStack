// In app/(app)/trips/add-destination.js (FINAL, WORKING VERSION)
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../../src/services/api';
import { COLORS } from '../../../constants/theme';
import { Picker } from '@react-native-picker/picker';

export default function AddDestinationScreen() {
  const router = useRouter();
  // THIS IS THE FIX: Correctly get both parameters passed from the previous screen
  const { destination: destinationString, itineraryId: passedItineraryId } = useLocalSearchParams();
  
  // Safely parse the destination object
  const destination = destinationString ? JSON.parse(destinationString) : null;

  const [dayNumber, setDayNumber] = useState('1');
  const [startTime, setStartTime] = useState('');
  const [userItineraries, setUserItineraries] = useState([]);
  const [selectedItinerary, setSelectedItinerary] = useState(passedItineraryId || null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all of the user's itineraries to populate the dropdown
  useEffect(() => {
    const fetchItineraries = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/api/planner/itineraries/');
        setUserItineraries(res.data);
      } catch (e) {
        console.error("Failed to fetch itineraries", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItineraries();
  }, []);

  // THIS IS THE FIX: A second effect that runs ONLY when the itinerary list changes.
  useEffect(() => {
    // If a specific itinerary was passed, use it.
    if (passedItineraryId) {
      setSelectedItinerary(passedItineraryId);
    } 
    // Otherwise, if the list is not empty, default to the first one.
    else if (userItineraries.length > 0) {
      setSelectedItinerary(userItineraries[0].id);
    }
  }, [userItineraries, passedItineraryId]); 

  const handleAddItem = async () => {
    // This now correctly uses the 'selectedItinerary' state
    if (!selectedItinerary || !dayNumber) {
      Alert.alert("Missing Information", "Please select a trip and enter a day number.");
      return;
    }
    setIsLoading(true);
    try {
      await api.post(`/api/planner/itineraries/${selectedItinerary}/items/`, {
        destination_id: destination.id,
        day_number: parseInt(dayNumber),
        start_time: startTime || null,
      });
      Alert.alert("Success!", `${destination.name} has been added to your trip.`, [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error("Failed to add item:", error.response?.data || error);
      Alert.alert("Error", "Could not add this destination to your trip.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!destination) {
    return <Text style={styles.errorText}>Destination data is missing.</Text>;
  }
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add <Text style={{color: COLORS.primary}}>{destination.name}</Text> to Your Trip</Text>
      
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Text style={styles.label}>Select a Trip Plan</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedItinerary}
              onValueChange={(itemValue) => setSelectedItinerary(itemValue)}
            >
              {userItineraries.map(itin => (
                <Picker.Item key={itin.id} label={itin.name} value={itin.id} />
              ))}
            </Picker>
          </View>
          
          <Text style={styles.label}>Day Number</Text>
          <TextInput style={styles.input} value={dayNumber} onChangeText={setDayNumber} keyboardType="number-pad" />

          <Text style={styles.label}>Start Time (Optional)</Text>
          <TextInput style={styles.input} placeholder="HH:MM (e.g., 09:00)" value={startTime} onChangeText={setStartTime} />

          <TouchableOpacity style={styles.addButton} onPress={handleAddItem} disabled={isLoading}>
            <Text style={styles.addButtonText}>{isLoading ? 'Adding...' : 'Add to Trip'}</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

// Full, professional stylesheet
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  errorText: { textAlign: 'center', marginTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  label: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 10, marginTop: 15 },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});