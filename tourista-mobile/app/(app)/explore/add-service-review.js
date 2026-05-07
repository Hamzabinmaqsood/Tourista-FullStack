// In app/(app)/explore/add-service-review.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../../src/services/api';
import { COLORS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// Custom Interactive Star Rating Component
const StarRating = ({ rating, onRatingChange }) => {
  const labels = ['Terrible', 'Bad', 'OK', 'Good', 'Amazing'];
  
  return (
    <View style={styles.ratingContainer}>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onRatingChange(star)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={40}
              color={star <= rating ? '#FFD700' : '#E0E0E0'}
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.ratingLabel}>
        {labels[rating - 1] || 'Select Rating'}
      </Text>
    </View>
  );
};

export default function AddServiceReviewScreen() {
  const router = useRouter();
  const { service: serviceString } = useLocalSearchParams();
  const service = JSON.parse(serviceString);

  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitReview = async () => {
    if (rating < 1) {
      Toast.show({ type: 'error', text1: 'Rating Required', text2: 'Please select a star rating.' });
      return;
    }
    setIsLoading(true);
    try {
      await api.post(`/api/reviews/services/${service.id}/reviews/create/`, {
        rating: rating,
        comment: comment,
      });

      Toast.show({
        type: 'success',
        text1: 'Review Submitted',
        text2: 'Thank you for your feedback!',
      });
      setTimeout(() => router.back(), 1500);

    } catch (error) {
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Ionicons name="star" size={40} color="#FFD700" />
        <Text style={styles.title}>Rate Your Experience With</Text>
        <Text style={styles.serviceName}>{service.name}</Text>
      </View>

      {/* Custom Interactive Star Rating */}
      <StarRating 
        rating={rating} 
        onRatingChange={setRating} 
      />
      
      <Text style={styles.label}>Share your experience (optional)</Text>
      <TextInput
        style={styles.commentInput}
        placeholder="What did you like about this service?"
        value={comment}
        onChangeText={setComment}
        multiline
        maxLength={500}
      />
      <Text style={styles.charCount}>{500 - comment.length} characters remaining</Text>

      <TouchableOpacity 
        style={[styles.submitButton, isLoading && { backgroundColor: COLORS.textSecondary }]} 
        onPress={handleSubmitReview}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Review</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '600', color: COLORS.text, marginTop: 10 },
  serviceName: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: COLORS.primary, 
    marginTop: 5, 
    textAlign: 'center',
    lineHeight: 30,
  },
  label: { fontSize: 16, fontWeight: '500', color: COLORS.textSecondary, marginBottom: 10, marginTop: 20 },
  commentInput: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  // Star Rating Styles
  ratingContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  star: {
    marginHorizontal: 5,
  },
  ratingLabel: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});