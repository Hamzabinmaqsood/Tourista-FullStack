// // In app/(app)/plan/detailed-planner.js
// import React, { useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView, ActivityIndicator } from 'react-native';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { COLORS } from '../../../constants/theme';
// import { Ionicons } from '@expo/vector-icons';
// import api from '../../../src/services/api';

// // --- Reusable OptionButton component ---
// const OptionButton = ({ text, isSelected, onPress }) => (
//   <TouchableOpacity
//     style={[styles.option, isSelected && styles.selectedOption]}
//     onPress={onPress}
//   >
//     <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>{text}</Text>
//     {isSelected && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
//   </TouchableOpacity>
// );

// export default function DetailedPlannerScreen() {
//   const router = useRouter();
//   const { destinationName } = useLocalSearchParams(); // Get destination from previous screen

//   const [duration, setDuration] = useState('');
//   const [budgetRange, setBudgetRange] = useState('');
//   const [travelStyle, setTravelStyle] = useState('');
//   const [accommodation, setAccommodation] = useState([]);
//   const [transportation, setTransportation] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async () => {
//     // Basic validation
//     if (!duration || !budgetRange || !travelStyle || accommodation.length === 0 || !transportation) {
//       Alert.alert("Incomplete", "Please fill out all sections to continue.");
//       return;
//     }
//     setIsLoading(true);
    
//     const detailedPreferences = {
//       destination: destinationName,
//       duration,
//       budget: budgetRange,
//       style: travelStyle,
//       accommodation: accommodation.join(', '),
//       transportation
//     };

//     try {
//       // We will create this new, powerful backend endpoint next
//       const response = await api.post('/api/planner/generate-itinerary/', detailedPreferences);
      
//       // Navigate to a new screen to display the generated itinerary
//       router.push({
//         pathname: '/trips/customize-trip',
//         params: { itinerary: JSON.stringify(response.data) }
//       });

//     } catch (error) {
//       console.error("Failed to generate itinerary:", error.response?.data || error);
//       Alert.alert("Generation Failed", "Our AI is busy planning other adventures. Please try again in a moment.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Trip to <Text style={{ color: COLORS.primary }}>{destinationName}</Text></Text>
//       <Text style={styles.subtitle}>Let's customize the details for your perfect trip.</Text>

//       {/* Duration */}
//       <Text style={styles.sectionTitle}>How long is your stay?</Text>
//       <TextInput style={styles.input} placeholder="e.g., 5 days" value={duration} onChangeText={setDuration} />

//       {/* Budget Range */}
//       <Text style={styles.sectionTitle}>What's your budget style?</Text>
//       <View style={styles.optionsContainer}>
//         {['Economy', 'Mid-Range', 'Luxury'].map(opt => (
//           <OptionButton key={opt} text={opt} isSelected={budgetRange === opt} onPress={() => setBudgetRange(opt)} />
//         ))}
//       </View>
      
//       {/* Travel Style */}
//       <Text style={styles.sectionTitle}>What's your travel style?</Text>
//       <View style={styles.optionsContainer}>
//         {['Adventure', 'Relaxation', 'Cultural', 'Family'].map(opt => (
//           <OptionButton key={opt} text={opt} isSelected={travelStyle === opt} onPress={() => setTravelStyle(opt)} />
//         ))}
//       </View>

//       {/* Accommodation (Multi-select) */}
//       <Text style={styles.sectionTitle}>Preferred accommodation types?</Text>
//       <View style={styles.optionsContainer}>
//         {['Hotels', 'Guest Houses', 'Camping', 'Resorts'].map(opt => (
//           <OptionButton 
//             key={opt} 
//             text={opt} 
//             isSelected={accommodation.includes(opt)} 
//             onPress={() => {
//               const newAcc = accommodation.includes(opt) 
//                 ? accommodation.filter(a => a !== opt) 
//                 : [...accommodation, opt];
//               setAccommodation(newAcc);
//             }} 
//           />
//         ))}
//       </View>
      
//       {/* Transportation */}
//       <Text style={styles.sectionTitle}>How will you get around?</Text>
//       <View style={styles.optionsContainer}>
//         {['Car Rental', 'Public Transport', 'Walking Routes'].map(opt => (
//           <OptionButton key={opt} text={opt} isSelected={transportation === opt} onPress={() => setTransportation(opt)} />
//         ))}
//       </View>

//       <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
//         {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>✨ Generate My Itinerary</Text>}
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
//   title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, textAlign: 'center' },
//   subtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 30 },
//   sectionTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginTop: 20, marginBottom: 15 },
//   input: { backgroundColor: COLORS.card, padding: 15, borderRadius: 10, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
//   optionsContainer: { gap: 10 },
//   option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.card, padding: 18, borderRadius: 10, borderWidth: 2, borderColor: '#eee' },
//   selectedOption: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '1A' },
//   optionText: { fontSize: 16, fontWeight: '500' },
//   selectedOptionText: { color: COLORS.primary, fontWeight: 'bold' },
//   submitButton: { backgroundColor: COLORS.secondary, padding: 20, borderRadius: 10, alignItems: 'center', marginTop: 40, marginBottom: 20 },
//   submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
// });

// app/(app)/trips/detailed-planner.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../src/services/api';

// --- Reusable OptionButton component ---
const OptionButton = ({ text, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.option, isSelected && styles.selectedOption]}
    onPress={onPress}
  >
    <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>{text}</Text>
    {isSelected && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
  </TouchableOpacity>
);

export default function DetailedPlannerScreen() {
  const router = useRouter();
  const { destinationName } = useLocalSearchParams(); // Get destination from previous screen

  // Use the exact variable names Gemini expects
  const [duration, setDuration] = useState('');             // e.g., "3" or "3 days"
  const [budget, setBudget] = useState('');                 // e.g., "Mid-Range"
  const [style, setStyle] = useState('');                   // e.g., "Adventure"
  const [accommodation, setAccommodation] = useState([]);   // array of strings
  const [transportation, setTransportation] = useState(''); // e.g., "Car Rental"
  const [isLoading, setIsLoading] = useState(false);

  // Live summary values (displayed on this screen before generating)
  const summary = {
    destination: destinationName || 'Unknown Destination',
    duration: duration || 'N/A',
    budget: budget || 'N/A',
    style: style || 'N/A',
    accommodation: accommodation.length ? accommodation.join(', ') : 'N/A',
    transportation: transportation || 'N/A',
  };

  // Validate form fields in a friendly way
  const validateForm = () => {
    if (!duration) {
      Alert.alert('Missing info', 'Please enter the trip duration (e.g., 3 days).');
      return false;
    }
    if (!budget) {
      Alert.alert('Missing info', 'Please select a budget style.');
      return false;
    }
    if (!style) {
      Alert.alert('Missing info', 'Please select a travel style.');
      return false;
    }
    if (accommodation.length === 0) {
      Alert.alert('Missing info', 'Please select at least one accommodation preference.');
      return false;
    }
    if (!transportation) {
      Alert.alert('Missing info', 'Please select a transportation option.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    // For the "I have a destination in my mind" flow we: estimate budget -> navigate to customize-trip
    if (!validateForm()) return;

    setIsLoading(true);

    const preferences = {
      duration,
      budget,          // "budget" key (string) matches backend expectation
      travel_style: style,
      accommodation: accommodation.join(', '),
      transportation,
    };

    // Build the lightweight itinerary object we pass to customize-trip
    const itinerary = {
      destination: destinationName || 'Unknown Destination',
      duration,
      budget,
      style,
      accommodation: accommodation.join(', '),
      transportation,
    };

    try {
      // Call your budget endpoint (must exist: /api/planner/estimate-budget/)
      const budgetResp = await api.post('/api/planner/estimate-budget/', {
        destination: itinerary.destination,
        preferences: preferences,
      });

      // Budget endpoint should return JSON like { total_budget_pkr: 85000, breakdown: [...] }
      const budgetData = budgetResp.data;

      // Attach budget data into itinerary object for the next screen
      itinerary.budget_estimate = budgetData;

      // Navigate to customize-trip and pass the itinerary as a JSON string in params
      router.push({
        pathname: '/trips/customize-trip',
        params: {
          itinerary: JSON.stringify(itinerary),
        },
      });

    } catch (err) {
      console.error('Budget fetch / submit failed:', err.response?.data || err);
      Alert.alert('Error', 'Could not estimate the budget — please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Trip to <Text style={{ color: COLORS.primary }}>{destinationName || '—'}</Text>
      </Text>
      <Text style={styles.subtitle}>Customize details — summary updates live</Text>

      {/* SUMMARY CARD (live) */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{summary.destination}</Text>
        <View style={styles.detailBox}>
          <Text style={styles.label}>Duration:</Text>
          <Text style={styles.value}>{summary.duration}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.label}>Budget Style:</Text>
          <Text style={styles.value}>{summary.budget}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.label}>Travel Style:</Text>
          <Text style={styles.value}>{summary.style}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.label}>Accommodation:</Text>
          <Text style={styles.value}>{summary.accommodation}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.label}>Transport:</Text>
          <Text style={styles.value}>{summary.transportation}</Text>
        </View>
      </View>

      {/* FORM FIELDS */}
      <Text style={styles.sectionTitle}>How long is your stay?</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 3 days"
        value={duration}
        onChangeText={setDuration}
      />

      <Text style={styles.sectionTitle}>What's your budget style?</Text>
      <View style={styles.optionsContainer}>
        {['Economy', 'Mid-Range', 'Luxury'].map(opt => (
          <OptionButton key={opt} text={opt} isSelected={budget === opt} onPress={() => setBudget(opt)} />
        ))}
      </View>

      <Text style={styles.sectionTitle}>What's your travel style?</Text>
      <View style={styles.optionsContainer}>
        {['Adventure', 'Relaxation', 'Cultural', 'Family'].map(opt => (
          <OptionButton key={opt} text={opt} isSelected={style === opt} onPress={() => setStyle(opt)} />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Preferred accommodation types?</Text>
      <View style={styles.optionsContainer}>
        {['Hotels', 'Guest Houses', 'Camping', 'Resorts'].map(opt => (
          <OptionButton
            key={opt}
            text={opt}
            isSelected={accommodation.includes(opt)}
            onPress={() => {
              const newAcc = accommodation.includes(opt)
                ? accommodation.filter(a => a !== opt)
                : [...accommodation, opt];
              setAccommodation(newAcc);
            }}
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>How will you get around?</Text>
      <View style={styles.optionsContainer}>
        {['Car Rental', 'Public Transport', 'Walking Routes', 'Personal Car'].map(opt => (
          <OptionButton key={opt} text={opt} isSelected={transportation === opt} onPress={() => setTransportation(opt)} />
        ))}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>✨ Generate My Itinerary</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

// (Keep your existing stylesheet, or use below as reference)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, textAlign: 'center' },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 20 },
  summaryCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 12, marginBottom: 18 },
  summaryTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primary, textAlign: 'center', marginBottom: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 12, marginBottom: 8 },
  input: { backgroundColor: COLORS.card, padding: 12, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  optionsContainer: { gap: 10, marginBottom: 6 },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.card, padding: 14, borderRadius: 10, borderWidth: 2, borderColor: '#eee', marginBottom: 8 },
  selectedOption: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '1A' },
  optionText: { fontSize: 16, fontWeight: '500' },
  selectedOptionText: { color: COLORS.primary, fontWeight: 'bold' },
  submitButton: { backgroundColor: COLORS.secondary, padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 16, marginBottom: 30 },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  detailBox: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  value: { fontSize: 14, color: COLORS.textSecondary }
});
