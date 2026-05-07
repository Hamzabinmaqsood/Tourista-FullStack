// In app/(app)/trips/recommend-results.js (FINAL, WORKING VERSION)
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../../src/services/api';

const DestinationCard = ({ item, preferences }) => {
  const router = useRouter();
  // THIS IS THE FIX: State variables are defined once and correctly.
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleBudgetDetails = async () => {
    setIsEstimating(true);
    try {
      const response = await api.post('/api/planner/estimate-budget/', {
        destination: item.name,
        preferences: preferences,
      });
      router.push({
        pathname: '/trips/budget-details',
        params: { budget: JSON.stringify(response.data) },
      });
    } catch (error) {
      console.error('Failed to estimate budget:', error);
      Alert.alert('Error', 'Could not estimate the budget at this time.');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSaveTripIdea = async () => {
    setIsSaving(true);
    try {
      const response = await api.post('/api/planner/save-trip-idea/', {
        name: item.name,
        city: item.city,
      });
      router.push(`/trips/${response.data.itinerary_id}`);
    } catch (error) {
      console.error('Failed to save trip idea:', error);
      Alert.alert('Error', 'Could not save this trip idea.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      <ImageBackground
        source={
          item.image_url
            ? { uri: item.image_url }
            : require('../../../assets/images/default-destination.png')
        }
        style={styles.cardImage}
        imageStyle={{ borderRadius: 16 }}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
        />
        <View style={styles.matchBadge}>
          <Ionicons name="sparkles" size={16} color="#fff" />
          <Text style={styles.matchText}>Top Match</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardLocation}>{item.city}</Text>
        </View>
      </ImageBackground>

      <View style={styles.cardContent}>
        <Text style={styles.aiReason}>
          <Text style={{ fontWeight: 'bold' }}>Tourista recommends:</Text>{' '}
          {item.reason}
        </Text>

        <View style={styles.tagsContainer}>
          {item.tags &&
            item.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
        </View>

        {item.estimated_budget_pkr && (
          <View style={styles.budgetContainer}>
            <Text style={styles.budgetLabel}>Estimated Trip Budget</Text>
            <Text style={styles.budgetValue}>
              Rs {Number(item.estimated_budget_pkr).toLocaleString()}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={handleBudgetDetails}
            disabled={isEstimating}
          >
            {isEstimating ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.detailsButtonText}>Budget Details</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.planButton}
            onPress={handleSaveTripIdea}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.planButtonText}>Save Trip Idea</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function RecommendationResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const recommendations = useMemo(() => {
    try {
      return params.results
        ? JSON.parse(params.results).recommendations || []
        : [];
    } catch (e) {
      console.error('Failed to parse recommendation results:', e);
      return [];
    }
  }, [params.results]);

  const userPreferences = useMemo(() => {
    try {
      return params.answers ? JSON.parse(params.answers) : {};
    } catch (e) {
      console.error('Failed to parse user answers:', e);
      return {};
    }
  }, [params.answers]);

  if (!recommendations || recommendations.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="compass-outline"
            size={80}
            color={COLORS.textSecondary}
          />
          <Text style={styles.emptyTitle}>No Recommendations Found</Text>
          <Text style={styles.emptyText}>
            We couldn't find a perfect match. Try adjusting your selections.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={recommendations}
        renderItem={({ item }) => (
          <DestinationCard item={item} preferences={userPreferences} />
        )}
        keyExtractor={(item) => item.name}
        ListHeaderComponent={
          <Text style={styles.headerTitle}>Your Top Matches</Text>
        }
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  cardImage: {
    width: '100%',
    height: 200,
    justifyContent: 'flex-end',
  },
  overlay: { ...StyleSheet.absoluteFillObject, borderRadius: 16 },
  titleContainer: { padding: 15 },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  cardLocation: {
    fontSize: 16,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  matchBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  matchText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 12,
  },
  cardContent: { padding: 15 },
  aiReason: {
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    marginBottom: 15,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 5,
  },
  tagText: {
    color: COLORS.primary,
    marginLeft: 5,
    fontWeight: '500',
    fontSize: 12,
  },
  budgetContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  budgetValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  detailsButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  detailsButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  planButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  planButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 25,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});