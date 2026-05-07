// In app/(app)/trips/[id].js (FINAL, COMPLETE, WORKING VERSION)
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Button, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import { useLocalSearchParams, Stack, useRouter, useFocusEffect } from 'expo-router';
import api from '../../../src/services/api';
import { COLORS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';

// --- Reusable Components ---

const ItineraryDayItem = ({ item, onRemove }) => (
  <View style={styles.dayItem}>
    <View style={styles.itemDetails}>
      <Text style={styles.itemTitle}>{item.destination.name}</Text>
      <Text style={styles.itemLocation}>{item.destination.city}</Text>
    </View>
    <TouchableOpacity onPress={onRemove}>
      <Ionicons name="trash-bin-outline" size={24} color={COLORS.error} />
    </TouchableOpacity>
  </View>
);

const ItineraryDay = ({ dayNumber, items, onRemoveItem }) => (
  <View style={styles.dayContainer}>
    <Text style={styles.dayHeader}>Day {dayNumber}</Text>
    {items.map(item => <ItineraryDayItem key={item.id} item={item} onRemove={() => onRemoveItem(item.id)} />)}
  </View>
);

const WeatherCard = ({ weather }) => (
  <View style={styles.infoCard}>
    <Ionicons name="cloudy-outline" size={24} color={COLORS.primary} />
    <View style={styles.infoCardContent}>
      <Text style={styles.infoCardTitle}>{weather.city}</Text>
      <Text style={styles.infoCardText}>{weather.temp}°C - {weather.description}</Text>
    </View>
  </View>
);

const EventCard = ({ event }) => (
  <View style={styles.infoCard}>
    <Ionicons name="calendar-outline" size={24} color={COLORS.secondary} />
    <View style={styles.infoCardContent}>
      <Text style={styles.infoCardTitle}>{event.name}</Text>
      <Text style={styles.infoCardText}>{event.city} - {new Date(event.start_date).toDateString()}</Text>
    </View>
  </View>
);

// --- Main Screen Component ---

export default function ItineraryDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [itinerary, setItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [localEvents, setLocalEvents] = useState([]);

  useFocusEffect(
    useCallback(() => {
      // 1. The async data-fetching logic is defined INSIDE the callback.
      const fetchData = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
          const [itineraryRes, eventsRes] = await Promise.all([
            api.get(`/api/planner/itineraries/${id}/`),
            api.get('/api/planner/events/')
          ]);
          const itineraryData = itineraryRes.data;
          setItinerary(itineraryData);

          const tripCities = [...new Set(itineraryData.items.map(item => item.destination.city))];
          if (tripCities.length > 0) {
            const weatherRes = await api.post('/api/planner/weather/bulk/', { cities: tripCities });
            setWeatherAlerts(weatherRes.data || []);
          } else {
            setWeatherAlerts([]);
          }
          
          const relevantEvents = eventsRes.data.filter(event => tripCities.includes(event.city));
          setLocalEvents(relevantEvents);
        } catch (error) {
          console.error("Failed to fetch itinerary details:", error);
        } finally {
          setIsLoading(false);
        }
      };

      // 2. Call the async function.
      fetchData();

      // 3. (Optional but good practice) Return a cleanup function.
      return () => {
        // This can be used to cancel the request if the user navigates away,
        // but for now, an empty function is fine.
      };
    }, [id]) // The dependency array is correct.
  );
  const handleDeleteItinerary = async () => {
    Alert.alert("Delete Trip", "Are you sure you want to permanently delete this trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/api/planner/itineraries/${id}/`);
            Toast.show({ type: 'success', text1: 'Trip Deleted' });
            router.back();
          } catch (error) {
            Alert.alert("Error", "Could not delete this trip.");
          }
        },
      },
    ]);
  };
  
  const groupedItems = itinerary?.items.reduce((acc, item) => {
    const day = item.day_number;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});

  const handleRemoveItem = async (itemId) => {
    Alert.alert("Remove Destination", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: async () => {
          const originalItems = itinerary.items;
          setItinerary(prev => ({ ...prev, items: prev.items.filter(item => item.id !== itemId) }));
          try {
            await api.delete(`/api/planner/itineraries/${id}/items/${itemId}/`);
          } catch (error) {
            setItinerary(prev => ({ ...prev, items: originalItems })); // Revert on failure
            Alert.alert("Error", "Could not remove destination.");
          }
        }}
    ]);
  };
  
  const handleStartNavigation = async () => {
    if (!itinerary || itinerary.items.length === 0) {
      Alert.alert("No Destination", "Add a destination to start navigation.");
      return;
    }
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location access is required.');
      return;
    }
    try {
      await Location.getCurrentPositionAsync({}); // Prime the location
      const firstDestination = itinerary.items[0].destination;
      const { latitude: destLat, longitude: destLon, name: label } = firstDestination;
      
      const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
      const latLng = `${destLat},${destLon}`;
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${encodeURIComponent(label)})`
      });
      Linking.openURL(url);
    } catch (error) {
      console.error("Failed to get location:", error);
      Alert.alert("Error", "Could not get your current location.");
    }
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;
  }

  if (!itinerary) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.errorText}>Could not load itinerary details.</Text>
            <Button title="Go Back" onPress={() => router.back()} />
        </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: itinerary.name,
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginRight: 15 }}>
              <TouchableOpacity onPress={() => router.push({ pathname: '/trips/add-destination', params: { itineraryId: id } })}>
                <Ionicons name="add-circle" size={32} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteItinerary}>
                <Ionicons name="trash-bin-outline" size={28} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          )
        }} 
      />
      
      {(weatherAlerts.length > 0 || localEvents.length > 0) && (
        <View style={styles.infoSection}>
          {weatherAlerts.length > 0 && <Text style={styles.sectionHeader}>Weather Forecast</Text>}
          {weatherAlerts.map((weather, index) => <WeatherCard key={`weather-${index}`} weather={weather} />)}
          {localEvents.length > 0 && <Text style={styles.sectionHeader}>Local Events</Text>}
          {localEvents.map(event => <EventCard key={`event-${event.id}`} event={event} />)}
        </View>
      )}
      
      <View style={styles.mapButtonContainer}>
        <TouchableOpacity style={styles.navButton} onPress={handleStartNavigation}>
          <Ionicons name="navigate-circle-outline" size={28} color="#fff" />
          <Text style={styles.navButtonText}>Start Trip Navigation</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.planSection}>
        <Text style={styles.sectionHeader}>Daily Plan</Text>
        {groupedItems && Object.keys(groupedItems).length > 0 ? (
          Object.entries(groupedItems).map(([dayNumber, items]) => (
            <ItineraryDay key={dayNumber} dayNumber={dayNumber} items={items} onRemoveItem={handleRemoveItem} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={60} color="#AEB8C4" />
            <Text style={styles.emptyTitle}>Your Itinerary is Empty</Text>
            <Text style={styles.emptySubtitle}>Tap the '+' button in the header to add destinations.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 15,
    marginBottom: 10,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  infoCardContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  infoCardText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  mapButtonContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  planSection: {
    paddingHorizontal: 20,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
  },
  dayHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  dayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  itemLocation: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 5,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    color: COLORS.error,
  },
    // /new
  //   navButton: { flexDirection: 'row', backgroundColor: COLORS.secondary, padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  // navButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  // },

  // new
  navButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary, // Changed to a more prominent brand color
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});