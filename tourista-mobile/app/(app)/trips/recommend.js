// In app/(app)/trips/recommend.js (FINAL with Auto Location Detection)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  ImageBackground,
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { COLORS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../src/services/api';

const QUESTIONS = [
  {
    id: 'scenery',
    text: "🌄 What kind of scenery are you dreaming of?",
    options: [
      '🏔️ Snow-Capped Mountains',
      '🌳 Lush Green Valleys',
      '🏖️ Beaches & Blue Waters',
      '🏙️ Historic Cities & Landmarks',
      '🏕️ Lakes & Riversides',
    ],
    isMultiSelect: true,
    maxSelect: 2,
  },
  {
    id: 'vibe',
    text: "🎯 What’s the main vibe for this trip?",
    options: [
      '💪 Adventure & Thrill',
      '🧘 Relaxation & Peace',
      '🏛️ Culture & Heritage',
      '👨‍👩‍👧 Family Fun',
      '🍴 Food & Local Cuisine',
    ],
    isMultiSelect: false,
  },
  {
    id: 'group_size',
    text: "👥 How many people are traveling?",
    options: [
      '🧍 Just Me (Solo)',
      '💑 Couple (2)',
      '👨‍👩‍👦 Small Group (3-4)',
      '🚌 Large Group (5+)',
    ],
    isMultiSelect: false,
  },
  {
    id: 'duration',
    text: "⏳ How long will your trip be?",
    options: [
      '🗓️ Weekend (2–3 Days)',
      '🗓️ Short Trip (4–6 Days)',
      '🗓️ Full Week (7+ Days)',
    ],
    isMultiSelect: false,
  },
  {
    id: 'transport_mode',
    text: "🚗 How will you be traveling?",
    options: [
      '🚗 Personal Car',
      '🚐 Rented Vehicle',
      '🚌 Public Transport',
      '✈️ Domestic Flight',
    ],
    isMultiSelect: false,
  },
  {
  id: 'departure_city',
  text: "📍 Where will you start your journey from?",
  options: [
    'Muzaffarabad', 'Mirpur', 'Rawalakot', 'Neelum Valley',
    'Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Peshawar',
    'Quetta', 'Multan', 'Faisalabad', 'Sialkot', 'Hyderabad',
    'Gilgit', 'Skardu', 'Hunza', 'Swat', 'Murree',
    'Abbottabad', 'Naran', 'Kaghan', 'Chitral', 'Bahawalpur',
    'Sukkur', 'Gujranwala', 'Sahiwal', 'Okara', 'Dera Ismail Khan',
    'Mardan', 'Gwadar', 'Ziarat'
  ],
  isMultiSelect: false,
  searchable: true, // ✅ enable search feature if your UI supports it
  },
  {
    id: 'accommodation',
    text: "🏨 What type of stay do you prefer?",
    options: [
      '🛏️ Budget Guest House',
      '🏡 Mid-Range Hotel',
      '🏰 Luxury Resort',
      '⛺ Camping or Homestay',
    ],
    isMultiSelect: false,
  },
  {
    id: 'food_preference',
    text: "🍛 What’s your meal preference during trips?",
    options: [
      '🍔 Street Food & Local Cafes',
      '🍽️ Mid-Range Restaurants',
      '🍷 Fine Dining & Premium Meals',
    ],
    isMultiSelect: false,
  },
  {
    id: 'spending_style',
    text: "💰 How do you describe your spending style?",
    options: [
      '💼 Budget-Conscious (Backpacker)',
      '💳 Standard (Comfortable)',
      '💎 Premium (Luxury)',
    ],
    isMultiSelect: false,
  },
  {
    id: 'extra_activities',
    text: "🎢 Any specific activities you’re interested in?",
    options: [
      '⛷️ Snow or Mountain Sports',
      '🚤 Boating or River Rafting',
      '📸 Photography & Nature',
      '🕌 Sightseeing & Culture',
      '🔥 Bonfire & Camping Nights',
    ],
    isMultiSelect: true,
    maxSelect: 3,
  },
];

const OptionButton = ({ option, isSelected, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={[styles.option, isSelected && styles.selectedOption]}>
      <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>{option}</Text>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} style={styles.checkIcon} />
      )}
    </View>
  </TouchableOpacity>
);

export default function RecommendDestinationScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectedCity, setDetectedCity] = useState(null);

  const currentQuestion = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const handleSelectOption = (questionId, option) => {
    const currentAnswers = answers[questionId] || [];
    if (currentQuestion.isMultiSelect) {
      if (currentAnswers.includes(option)) {
        setAnswers(prev => ({ ...prev, [questionId]: currentAnswers.filter(item => item !== option) }));
      } else if (currentAnswers.length < currentQuestion.maxSelect) {
        setAnswers(prev => ({ ...prev, [questionId]: [...currentAnswers, option] }));
      } else {
        Alert.alert(`You can select up to ${currentQuestion.maxSelect} options.`);
      }
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: [option] }));
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id] || answers[currentQuestion.id].length === 0) {
      Alert.alert('Please make a selection to continue.');
      return;
    }
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const formattedAnswers = Object.keys(answers).reduce((acc, key) => {
      acc[key] = answers[key].join(', ');
      return acc;
    }, {});
    try {
      const response = await api.post('/api/planner/recommend-destination/', formattedAnswers);
      router.push({
        pathname: '/trips/recommend-results',
        params: {
          results: JSON.stringify(response.data),
          answers: JSON.stringify(formattedAnswers),
        },
      });
    } catch (error) {
      console.error('Failed to get recommendations:', error.response?.data || error);
      Alert.alert('Error', 'Could not get recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 📍 Detect Location for Departure City
  const detectLocation = async () => {
    try {
      setDetecting(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to detect your city.');
        setDetecting(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const geo = await Location.reverseGeocodeAsync(loc.coords);
      if (geo.length > 0) {
        const city = geo[0].city || geo[0].district || geo[0].region;
        if (city) {
          setDetectedCity(city);
          setAnswers(prev => ({ ...prev, departure_city: [city] }));
        } else {
          Alert.alert('City not found.');
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Unable to detect location.');
    } finally {
      setDetecting(false);
    }
  };

  const isSelected = (questionId, option) => (answers[questionId] || []).includes(option);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progressText}>Step {step + 1} of {QUESTIONS.length}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.questionText}>{currentQuestion.text}</Text>

        {/* Auto Location Button for Departure City */}
        {currentQuestion.id === 'departure_city' && (
          <>
            {detectedCity ? (
              <Text style={{ marginBottom: 10, color: COLORS.textSecondary }}>
                📍 Detected City: <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>{detectedCity}</Text>
              </Text>
            ) : (
              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.primary,
                  padding: 12,
                  borderRadius: 10,
                  alignItems: 'center',
                  marginBottom: 10,
                }}
                onPress={detectLocation}
                disabled={detecting}
              >
                {detecting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Detect My Location</Text>
                )}
              </TouchableOpacity>
            )}
          </>
        )}

        {currentQuestion.options.map((option, index) => (
          <OptionButton
            key={`${currentQuestion.id}_${index}`}
            option={option}
            isSelected={isSelected(currentQuestion.id, option)}
            onPress={() => handleSelectOption(currentQuestion.id, option)}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButtonsContainer}>
          {step > 0 && (
            <TouchableOpacity style={styles.prevButton} onPress={handleBack}>
              <Text style={styles.prevButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextButton, step === 0 && { flex: 1 }]}
            onPress={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>
                {step === QUESTIONS.length - 1 ? 'Find My Destination' : 'Next'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: { alignItems: 'center', paddingHorizontal: 15, paddingTop: 20 },
  progressText: { textAlign: 'center', fontSize: 14, color: COLORS.textSecondary },
  progressContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 4,
  },
  progressBar: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },

  questionText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: 20,
    textAlign: 'center',
  },

  // ✅ Fixed clarity and removed blur-like overlay effect
  option: {
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    borderWidth: 2.5,
    borderColor: 'transparent',
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  iconOption: {
    backgroundColor: COLORS.card,
    borderColor: '#ddd',
    borderWidth: 2,
    justifyContent: 'flex-start',
  },

  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: '#fff7f0',
    elevation: 3,
  },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },

  optionIcon: { marginRight: 15 },

  optionText: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  iconOptionText: { color: COLORS.text, textShadowRadius: 0 },
  selectedOptionText: { color: COLORS.primary },

  checkIcon: { position: 'absolute', top: 10, right: 10 },

  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: COLORS.card,
  },
  footerButtonsContainer: { flexDirection: 'row', gap: 10 },
  prevButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    height: 55,
    justifyContent: 'center',
  },
  prevButtonText: { color: COLORS.textSecondary, fontSize: 18, fontWeight: 'bold' },
  nextButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    height: 55,
    justifyContent: 'center',
  },
  nextButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
