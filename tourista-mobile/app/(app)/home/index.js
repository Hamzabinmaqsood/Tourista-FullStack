// In app/(app)/home/index.js (FINAL, POLISHED VERSION)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ImageBackground } from 'react-native';
import api from '../../../src/services/api';
import { COLORS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// --- NEW, ENHANCED COMPONENTS TO MATCH YOUR DESIGN ---

const AIAssistantCard = ({ onPress, prompt }) => (
  <TouchableOpacity style={styles.aiCard} onPress={onPress}>
    <Ionicons name="sparkles-outline" size={24} color={COLORS.primary} />
    <Text style={styles.aiCardText} numberOfLines={1}>{prompt}</Text>
    <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
  </TouchableOpacity>
);

const DestinationCard = ({ item, onPress, onToggleFavorite, onAddToTrip }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <ImageBackground
      source={require('../../../assets/images/default-destination.png')} // Replace with item.image if added to backend
      style={styles.cardImage}
      imageStyle={{ borderRadius: 12 }}
    >
      <View style={styles.overlay} />
      <TouchableOpacity style={styles.favoriteButton} onPress={() => onToggleFavorite(item.id, item.is_favorite)}>
        <Ionicons name={item.is_favorite ? "heart" : "heart-outline"} size={28} color="#fff" />
      </TouchableOpacity>
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.city}</Text>
      </View>
    </ImageBackground>
    <View style={styles.cardFooter}>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color="#FFC107" />
        <Text style={styles.cardInfo}> {item.rating} ({item.review_count} reviews)</Text>
      </View>
      <TouchableOpacity style={styles.addToTripButton} onPress={() => onAddToTrip(item)}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addToTripText}>Add to Trip</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

// --- MAIN SCREEN COMPONENT ---

export default function HomeScreen() {
  const [allDestinations, setAllDestinations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrompt, setCurrentPrompt] = useState("Suggest a budget-friendly trek.");
  const router = useRouter();

  // This effect runs only ONCE to get the master list of all destinations.
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await api.get('/api/planner/all-destinations/');
        setAllDestinations(response.data);
      } catch (error) {
        console.error("Failed to fetch all destinations:", error);
      }
    };
    fetchInitialData();
  }, []);

  // This effect runs every time the screen is focused to get the LATEST favorites.
  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        setIsLoading(true);
        try {
          const response = await api.get('/api/auth/profile/');
          setProfile(response.data);
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    }, [])
  );

  // THIS IS THE FIX: A memoized selector that combines the data on the frontend.
  // It no longer filters out favorites, it just marks them.
  const recommendations = useMemo(() => {
    if (!profile || !allDestinations) return [];
    
    const favoriteIds = new Set(profile.profile.favorite_destinations.map(d => d.id));
    
    return allDestinations.map(rec => ({
        ...rec,
        is_favorite: favoriteIds.has(rec.id) 
      }));
  }, [allDestinations, profile]);

  const handleToggleFavorite = async (destinationId, isCurrentlyFavorite) => {
    // THIS IS THE FIX: We update the profile state optimistically.
    setProfile(prevProfile => {
      const currentFavorites = prevProfile.profile.favorite_destinations;
      const newFavorites = isCurrentlyFavorite
        ? currentFavorites.filter(dest => dest.id !== destinationId)
        : [...currentFavorites, { id: destinationId }]; // Add a placeholder
      
      return {
        ...prevProfile,
        profile: { ...prevProfile.profile, favorite_destinations: newFavorites }
      };
    });
    
    try {
      await api.post('/api/auth/favorites/toggle/', { destination_id: destinationId });
      Toast.show({ type: 'success', text1: isCurrentlyFavorite ? 'Removed from Favorites' : 'Added to Favorites' });
    } catch (error) {
      // Revert on failure by refetching the real profile
      const response = await api.get('/api/auth/profile/');
      setProfile(response.data);
      Alert.alert("Error", "Could not update favorites.");
    }
  };

  const handleAddToTrip = (destination) => {
router.push({
pathname: '/trips/add-destination',
params: { destination: JSON.stringify(destination) }
});
};

  return (
    <View style={styles.container}>
      {isLoading && recommendations.length === 0 ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }}/>
      ) : (
        <FlatList
          data={recommendations}
          renderItem={({ item }) => (
            <DestinationCard 
              item={item}
              onPress={() => router.push(`/destinations/${item.id}`)}
              onToggleFavorite={handleToggleFavorite}
              onAddToTrip={handleAddToTrip}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <>
              <Text style={styles.headerTitle}>For You</Text>
              <AIAssistantCard 
                onPress={() => router.push('/home/ai-chat')}
                prompt={currentPrompt}
              />
              <Text style={styles.subHeader}>Your Top Picks</Text>
            </>
          }
          ListEmptyComponent={<Text style={styles.emptyText}>No recommendations available.</Text>}
          ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

// THIS IS THE FINAL, POLISHED STYLESHEET TO MATCH YOUR SCREENSHOT
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FC' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, paddingHorizontal: 20, marginTop: 10 },
  subHeader: { fontSize: 22, fontWeight: '600', color: COLORS.text, paddingHorizontal: 20, marginVertical: 10 },
  aiCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 15, marginHorizontal: 20, marginVertical: 15, elevation: 2 },
  aiCardText: { flex: 1, marginLeft: 10, fontSize: 16, color: COLORS.textSecondary },
  card: { backgroundColor: COLORS.card, borderRadius: 15, marginHorizontal: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5 },
  cardImage: { height: 220, justifyContent: 'space-between' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12 },
  favoriteButton: { position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 25 },
  cardTextContainer: { position: 'absolute', bottom: 15, left: 15 },
  cardTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', textShadowRadius: 3, textShadowColor: 'rgba(0,0,0,0.5)' },
  cardSubtitle: { fontSize: 16, color: '#fff', textShadowRadius: 2, textShadowColor: 'rgba(0,0,0,0.5)' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  cardInfo: { fontSize: 14, color: COLORS.textSecondary, marginLeft: 5 },
  addToTripButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 15, borderRadius: 25 },
  addToTripText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  emptyText: { textAlign: 'center', marginTop: 50 },
});