// In app/(app)/destinations/[id].js
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect, Stack } from 'expo-router';
import api from '../../../src/services/api';
import { COLORS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import Toast from 'react-native-toast-message';

const ReviewItem = ({ review }) => {
  const renderStars = (rating) => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<Ionicons key={i} name={i <= rating ? "star" : "star-outline"} size={16} color="#FFC107" />);
    }
    return stars;
  };

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Ionicons name="person-circle-outline" size={40} color={COLORS.textSecondary} />
        <View style={styles.reviewHeaderText}>
          <Text style={styles.reviewUser}>{review.user}</Text>
          <Text style={styles.reviewDate}>{new Date(review.created_at).toLocaleDateString()}</Text>
        </View>
      </View>
      <View style={styles.reviewRatingContainer}>{renderStars(review.rating)}</View>
      <Text style={styles.reviewComment}>{review.comment}</Text>
    </View>
  );
};

export default function DestinationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { authState } = useAuth();
  
  const [destination, setDestination] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [destRes, reviewsRes, servicesRes, profileRes] = await Promise.all([
            api.get(`/api/planner/destinations/${id}/`),
            api.get(`/api/reviews/destinations/${id}/reviews/`),
            api.get(`/api/vendors/services/all/?destination_id=${id}`),
            api.get('/api/auth/profile/')
          ]);
          
          const destData = destRes.data;
          setDestination(destData);
          setReviews(reviewsRes.data);
          setServices(servicesRes.data);
          
          const favoriteIds = new Set(profileRes.data.profile.favorite_destinations.map(d => d.id));
          setIsFavorite(favoriteIds.has(parseInt(id)));

          if (destData.city) {
            const weatherRes = await api.post('/api/planner/weather/bulk/', { cities: [destData.city] });
            if (weatherRes.data?.length > 0) setWeather(weatherRes.data[0]);
          }
        } catch (error) { console.error("Failed to fetch details", error); } 
        finally { setIsLoading(false); }
      };
      fetchData();
    }, [id])
  );

  const handleToggleFavorite = async () => {
    setIsFavorite(prev => !prev);
    try {
      await api.post('/api/auth/favorites/toggle/', { destination_id: id });
      Toast.show({
        type: 'success',
        text1: isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
        position: 'bottom'
      });
    } catch (error) {
      setIsFavorite(prev => !prev);
      Alert.alert("Error", "Could not update favorites.");
    }
  };

  const handleContactProvider = async () => {
    if (services.length === 0) {
      Alert.alert("No Services Found", "There are currently no vendors for this destination.");
      return;
    }
    const firstService = services[0];
    try {
      const convoResponse = await api.post('/api/messaging/conversations/', {
        service_id: firstService.id,
        body: `Hi, I have a question about services at ${destination.name}.`
      });
      router.push(`/messages/${convoResponse.data.id}`);
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Could not start a conversation.";
      Alert.alert("Error", errorMessage);
    }
  };

  if (isLoading) return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;
  if (!destination) return <Text style={styles.errorText}>Destination not found.</Text>;
  
  const tags = ["Adventure", "Nature", "Photography"];
  const isUserAVendorHere = services.some(service => service.vendor.user_id === authState.userId);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: destination.name, headerTransparent: true, headerTintColor: '#fff' }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <ImageBackground source={require('../../../assets/images/default-destination.png')} style={styles.headerImage}>
          <View style={styles.overlay} />
        </ImageBackground>

        <View style={styles.content}>
          <Text style={styles.title}>{destination.name}</Text>
          <View style={styles.subHeaderContainer}>
            {weather && <Text style={styles.subHeaderText}>☀️ {weather.temp}°C</Text>}
            <TouchableOpacity onPress={() => alert('View all reviews')}>
              <Text style={styles.subHeaderText}>⭐ {destination.rating} ({destination.review_count} Reviews)</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{destination.description}</Text>
          <View style={styles.tagsContainer}>
            {tags.map(tag => <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>)}
          </View>
          
          <Text style={styles.sectionTitle}>Reviews</Text>
          {reviews.length > 0 ? (
            reviews.slice(0, 2).map(review => <ReviewItem key={review.id} review={review} />)
          ) : (
            <Text style={styles.noReviewsText}>Be the first to leave a review!</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.footerActions}>
        <TouchableOpacity style={styles.actionIcon} onPress={handleToggleFavorite}>
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={28} color={isFavorite ? COLORS.error : COLORS.primary} />
        </TouchableOpacity>
        
        {!isUserAVendorHere && (
          <TouchableOpacity style={styles.actionIcon} onPress={handleContactProvider}>
            <Ionicons name="chatbubbles-outline" size={28} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.addToTripButtonFooter} 
          onPress={() => router.push({ pathname: '/home/add-to-trip', params: { destination: JSON.stringify(destination) } })}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.buttonText}>Add to Trip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  errorText: { textAlign: 'center', marginTop: '50%' },
  headerImage: { height: 300, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  content: { marginTop: -40, backgroundColor: COLORS.background, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.text },
  subHeaderContainer: { flexDirection: 'row', gap: 15, marginVertical: 10, alignItems: 'center' },
  subHeaderText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginTop: 20, marginBottom: 10 },
  description: { fontSize: 16, color: COLORS.text, lineHeight: 24 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 15 },
  tag: { backgroundColor: COLORS.primary + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginRight: 10, marginBottom: 10 },
  tagText: { color: COLORS.primary, fontWeight: '500' },
  noReviewsText: { fontStyle: 'italic', color: COLORS.textSecondary },
  reviewCard: { backgroundColor: COLORS.card, borderRadius: 10, padding: 15, marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center' },
  reviewHeaderText: { marginLeft: 10 },
  reviewUser: { fontWeight: 'bold' },
  reviewDate: { fontSize: 12, color: COLORS.textSecondary },
  reviewRatingContainer: { flexDirection: 'row', marginVertical: 5 },
  reviewComment: { color: COLORS.textSecondary, marginTop: 5 },
  footerActions: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: '#e0e0e0', elevation: 10 },
  actionIcon: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 50, marginRight: 10 },
  addToTripButtonFooter: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 10, gap: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});