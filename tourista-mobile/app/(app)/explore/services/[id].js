// In app/(app)/explore/services/[id].js
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View,ImageBackground,handleBookNow,handleRateService } from 'react-native';
import { COLORS } from '../../../../constants/theme';
import api from '../../../../src/services/api';
import Toast from 'react-native-toast-message';
import { AirbnbRating } from 'react-native-ratings';
import { useAuth } from '../../../../context/AuthContext';

// Custom Star Display Component
const StarDisplay = ({ rating }) => {
  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={18}
          color={star <= rating ? '#FFD700' : '#E0E0E0'}
          style={styles.starIcon}
        />
      ))}
    </View>
  );
};

// --- Reusable Components ---

const InfoRow = ({ icon, label, value, onPress }) => (
  <TouchableOpacity onPress={onPress} disabled={!onPress} style={styles.infoRow}>
    <Ionicons name={icon} size={24} color={COLORS.secondary} style={styles.icon} />
    <View style={styles.valueContainer}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  </TouchableOpacity>
);

// Updated ReviewItem component with custom star display
const ReviewItem = ({ review }) => (
  <View style={styles.reviewCard}>
    <View style={styles.reviewHeader}>
      <Text style={styles.reviewUser}>{review.user}</Text>
      <StarDisplay rating={review.rating} />
    </View>
    <Text style={styles.reviewComment}>{review.comment}</Text>
  </View>
);

// --- Main Screen Component ---

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const [service, setService] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const { authState } = useAuth(); 

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
          const [serviceRes, profileRes, reviewsRes] = await Promise.all([
            api.get(`/api/vendors/services/detail/${id}/`),
            api.get('/api/auth/profile/'),
            api.get(`/api/reviews/services/${id}/reviews/`)
          ]);
          setService(serviceRes.data);
          setReviews(reviewsRes.data);
          const favoriteIds = profileRes.data.profile.favorite_destinations.map(dest => dest.id);
          setIsFavorite(favoriteIds.includes(serviceRes.data.destination?.id));
        } catch (error) { console.error("Failed to fetch details:", error); } 
        finally { setIsLoading(false); }
      };
      fetchData();
    }, [id])
  );


  const handleContactVendor = async () => {
    // Send a POST request to the 'create conversation' endpoint
    try {
      const response = await api.post('/api/messaging/conversations/', {
        service_id: service.id,
        // Send a default initial message
        body: `Hi, I have a question about your service: "${service.name}"`
      });
      
      // Navigate to the new or existing conversation room
      router.push(`/messages/${response.data.id}`);

    } catch (error) {
      // Handle case where conversation already exists but POST fails
      if (error.response?.status === 400 && error.response.data?.non_field_errors) {
        // We need to fetch the existing conversation ID. This requires a backend change.
        // For now, we'll alert the user. A better UX is a future enhancement.
        alert("A conversation for this service already exists. Please find it in your Messages tab.");
      } else {
        console.error("Failed to start conversation:", error.response?.data || error);
        alert("Could not start a conversation. Please try again later.");
      }
    }
  };


  const handleToggleFavorite = async () => {
    if (!service?.destination?.id) {
      Alert.alert("Error", "This service cannot be favorited.");
      return;
    }
    setIsFavorite(prev => !prev);
    try {
      await api.post('/api/auth/favorites/toggle/', {
        destination_id: service.destination.id
      });
      Toast.show({
        type: 'success',
        text1: isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
      });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      setIsFavorite(prev => !prev);
      Alert.alert("Error", "Could not update favorites.");
    }
  };

  // THIS IS THE FIX: Add the missing handler functions
  const handleRateService = () => {
    router.push({ pathname: '/explore/add-service-review', params: { service: JSON.stringify(service) } });
  };

  const handleBookNow = () => {
    // This should trigger your payment flow
    Alert.alert("Proceed to Booking", `Book this service for ${date.toLocaleDateString()}?`, [
        { text: "Cancel" },
        { text: "Confirm", onPress: () => router.push({ pathname: '/booking/payment', params: { serviceId: service.id, bookingDate: date.toISOString() }}) }
    ]);
  };

  if (isLoading || !service) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // --- THIS IS THE DEFINITIVE DIAGNOSTIC LOG ---
  // console.log("--- COMPARING IDs ---");
  // console.log("Logged in User ID (from authState):", authState.userId);
  // console.log("Service Vendor's User ID (from service data):", service.vendor.user);
  // console.log("Are they equal?:", authState.userId === service.vendor.user);
  // console.log("-----------------------");

  const isUserVendor = authState.userId === service.vendor.user_id;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: service.name,
          headerRight: () => (
            !isUserVendor && (
              <TouchableOpacity onPress={handleToggleFavorite} style={{ marginRight: 15 }}>
                <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={28} color={isFavorite ? COLORS.error : COLORS.textSecondary} />
              </TouchableOpacity>
            )
          )
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ImageBackground source={{ uri: service.cover_image || 'https://via.placeholder.com/400x200' }} style={styles.headerImage}>
          <View style={styles.overlay} />
          <Text style={styles.title}>{service.name}</Text>
          <Text style={styles.vendor}>by {service.vendor.business_name}</Text>
        </ImageBackground>

        {isUserVendor && (
          <View style={styles.vendorStatsContainer}>
            <View style={styles.statItem}><Ionicons name="eye-outline" size={20} /><Text style={styles.statText}>2,450 Views</Text></View>
            <View style={styles.statItem}><Ionicons name="bookmark-outline" size={20} /><Text style={styles.statText}>128 Bookings</Text></View>
          </View>
        )}

        <View style={styles.detailsContainer}>
          <InfoRow icon="information-circle-outline" label="Description" value={service.description} />
          <InfoRow icon="location-outline" label="City" value={service.city} />
          <InfoRow icon="calendar-outline" label="Select Date" value={date.toLocaleDateString()} onPress={() => setShowDatePicker(true)} />
        </View>

        {showDatePicker && (<DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />)}
        
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
            {!isUserVendor && (
              <TouchableOpacity onPress={handleRateService}>
                <Text style={styles.rateButtonText}>Rate this Service</Text>
              </TouchableOpacity>
            )}
          </View>
          {reviews.length > 0 ? (
            reviews.map(review => <ReviewItem key={review.id} review={review} />)
          ) : (
            <Text style={styles.noReviewsText}>No reviews yet.</Text>
          )}
        </View>
      </ScrollView>

      {/* --- The Single, Unified, Conditional Footer --- */}
      <View style={styles.footer}>
        {isUserVendor ? (
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => router.push({ pathname: '/vendor/manage-service', params: { service: JSON.stringify(service) }})}
          >
            <Ionicons name="pencil-outline" size={20} color="#fff" />
            <Text style={styles.bookButtonText}>Edit My Service</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionBar}>
            <TouchableOpacity style={styles.contactIcon} onPress={handleContactVendor}>
              <Ionicons name="chatbubbles-outline" size={30} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
              <View>
                <Text style={styles.bookButtonText}>Book Now</Text>
                <Text style={styles.priceText}>Rs {service.price} / {service.price_per}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

// THIS IS THE FINAL, UNIFIED STYLESHEET
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 120 },
  errorText: { textAlign: 'center', marginTop: 50, color: COLORS.error },
  headerImage: { height: 250, justifyContent: 'flex-end', padding: 20 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', textShadowRadius: 3, textShadowColor: '#000' },
  vendor: { fontSize: 16, color: '#eee', marginTop: 5, textShadowRadius: 2, textShadowColor: '#000' },
  vendorStatsContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.card, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  detailsContainer: { marginTop: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 20, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  reviewsSection: { padding: 20 },
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  rateButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
  noReviewsText: { color: COLORS.textSecondary, fontStyle: 'italic', textAlign: 'center', paddingVertical: 20 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: 15, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: '#e0e0e0', backgroundColor: COLORS.card, elevation: 10 },
  actionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  contactIcon: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 10 },
  bookButton: { flex: 1, backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginLeft: 15 },
  bookButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  priceText: { color: '#fff', fontSize: 12, opacity: 0.9 },
  editButton: { flex: 1, backgroundColor: COLORS.secondary, paddingVertical: 15, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
});