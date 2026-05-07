// In app/(app)/trips/_layout.js
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';

export default function TripsLayout() {
  const router = useRouter();

  return (
    <Stack>
      {/* THIS IS THE FIX: The header and its button are now removed from the main list screen. */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false, // The header is now inside the index.js file
        }}
      />
      
      {/* The Trip Detail screen will now have its own Add button */}
      <Stack.Screen name="[id]" options={{ title: 'Trip Details' }} />
      
      {/* All other screens in the stack remain the same */}
      <Stack.Screen name="map" options={{ title: 'Trip Map' }} />
      <Stack.Screen name="add" options={{ title: 'Create Itinerary', presentation: 'modal' }} />
      <Stack.Screen name="add-destination" options={{ title: 'Add Destination', presentation: 'modal' }} />
      <Stack.Screen name="add-review" options={{ title: 'Review Destination', presentation: 'modal' }} />
      <Stack.Screen name="plan-start" options={{ title: 'Start Planning' }} />
      <Stack.Screen name="recommend" options={{ title: 'Find a Destination' }} />
      <Stack.Screen name="recommend-results" options={{ title: 'AI Recommendations' }} />
      <Stack.Screen name="detailed-planner" options={{ title: 'Customize Your Trip' }} />
      <Stack.Screen name="view-itinerary" options={{ title: 'Generated Itinerary' }} />
      <Stack.Screen name="budget-details" options={{ presentation: 'modal' }} />
    </Stack>
  );
}