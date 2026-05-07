// In app/(app)/home/add-to-trip.js (FINAL, POLISHED VERSION)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import api from '../../../src/services/api';
import { COLORS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// The new, custom list item component to match your design
const ItinerarySelectItem = ({ item, onPress, isSelected }) => (
  <TouchableOpacity
    style={[styles.itemContainer, isSelected && styles.itemSelected]}
    onPress={onPress}
  >
    <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>{item.name}</Text>
    {isSelected && <Ionicons name="checkmark-circle" size={24} color={COLORS.card} />}
  </TouchableOpacity>
);

export default function AddToTripScreen() {
  const router = useRouter();
  const { destination: destinationString } = useLocalSearchParams();
  const destination = JSON.parse(destinationString);

  const [itineraries, setItineraries] = useState([]);
  const [selectedItineraryId, setSelectedItineraryId] = useState(null);
  const [dayNumber, setDayNumber] = useState('1');
  const [startTime, setStartTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItineraries = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/api/planner/itineraries/');
        setItineraries(response.data);
        if (response.data.length > 0) {
          setSelectedItineraryId(response.data[0].id);
        }
      } catch (error) { console.error("Failed to fetch itineraries:", error); }
      finally { setIsLoading(false); }
    };
    fetchItineraries();
  }, []);

  const handleAddToTrip = async () => {
    if (!selectedItineraryId) {
      Alert.alert("No Trip Selected", "Please select a trip or create a new one first.");
      return;
    }
    setIsLoading(true);
    try {
      await api.post(`/api/planner/itineraries/${selectedItineraryId}/items/`, {
        destination_id: destination.id,
        day_number: parseInt(dayNumber) || 1, // Default to day 1 if input is invalid
        start_time: startTime || null,
      });

      Toast.show({
        type: 'success',
        text1: 'Destination Added!',
        text2: `${destination.name} was added to your trip.`,
      });
      setTimeout(() => router.back(), 1500);

    } catch (error) {
      console.error("Failed to add destination:", error.response?.data || error);
      Alert.alert("Error", "Could not add this destination.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Add Destination" }} />
      <Text style={styles.title}>Add <Text style={{color: COLORS.primary}}>{destination.name}</Text> to Your Trip</Text>
      
      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <>
          <Text style={styles.label}>Select a Trip Plan</Text>
          <FlatList
            data={itineraries}
            renderItem={({ item }) => (
              <ItinerarySelectItem 
                item={item} 
                isSelected={item.id === selectedItineraryId}
                onPress={() => setSelectedItineraryId(item.id)}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<Text style={styles.emptyText}>No trips found. Create one in the "My Trips" tab!</Text>}
            style={{ maxHeight: 250 }} // Limit the height of the list
          />
          
          <Text style={styles.label}>Day Number</Text>
          <TextInput style={styles.input} value={dayNumber} onChangeText={setDayNumber} keyboardType="number-pad" />

          <Text style={styles.label}>Start Time (Optional)</Text>
          <TextInput style={styles.input} placeholder="HH:MM (e.g., 09:00)" value={startTime} onChangeText={setStartTime} />
        </>
      )}

      <TouchableOpacity 
        style={[styles.button, (isLoading) && styles.buttonDisabled]} 
        onPress={handleAddToTrip} 
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Add to Trip</Text>
      </TouchableOpacity>
    </View>
  );
}

// THIS IS THE FINAL, POLISHED STYLESHEET
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: COLORS.text,
  },
  label: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 10,
    marginTop: 15,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#eee',
  },
  itemSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  itemText: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '500',
  },
  itemTextSelected: {
    color: COLORS.card,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 'auto', 
  },
  buttonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});