// In app/(app)/trips/index.js (FINAL, UNIFIED VERSION)
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import api from '../../../src/services/api';
import { COLORS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const ItineraryCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardDates}>
        {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#C4C4C4" />
  </TouchableOpacity>
);

const PlanTripHeader = () => {
  const router = useRouter();
  return (
    <>
      <Text style={styles.headerTitle}>Plan a New Adventure</Text>
      <Text style={styles.headerSubtitle}>Let's create your next memorable journey.</Text>
      
      {/* Scenario 2: Get Recommendations */}
      <TouchableOpacity style={styles.planCard} onPress={() => router.push('/trips/recommend')}>
        <Ionicons name="sparkles-outline" size={32} color={COLORS.primary} />
        <View style={styles.planTextContainer}>
          <Text style={styles.planTitle}>Not sure where to go?</Text>
          <Text style={styles.planDescription}>Get personalized destination ideas from our AI.</Text>
        </View>
      </TouchableOpacity>
      
      {/* Scenario 1: Plan with a known destination */}
      <TouchableOpacity style={styles.planCard} onPress={() => router.push('/trips/select-destination')}>
        <Ionicons name="flag-outline" size={32} color={COLORS.primary} />
        <View style={styles.planTextContainer}>
          <Text style={styles.planTitle}>I have a destination in mind</Text>
          <Text style={styles.planDescription}>Build a detailed, day-by-day itinerary.</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.listHeader}>My Existing Trips</Text>
    </>
  );
};

export default function MyTripsScreen() {
  const router = useRouter();
  const [itineraries, setItineraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchItineraries = async () => {
        setIsLoading(true);
        try {
          const response = await api.get('/api/planner/itineraries/');
          setItineraries(response.data);
        } catch (error) {
          console.error("Failed to fetch itineraries:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchItineraries();
    }, [])
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={itineraries}
          renderItem={({ item }) => <ItineraryCard item={item} onPress={() => router.push(`/trips/${item.id}`)} />}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={<PlanTripHeader />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>You have no saved trips yet. Start by planning a new one!</Text>
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 50 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.text, textAlign: 'center' },
  headerSubtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 30 },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  planTextContainer: { flex: 1, marginLeft: 15 },
  planTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  planDescription: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  listHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 30,
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 25,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  cardDates: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 30, color: COLORS.textSecondary, fontSize: 16 },
});