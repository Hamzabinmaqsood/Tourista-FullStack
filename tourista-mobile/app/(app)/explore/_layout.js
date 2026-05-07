// In app/(app)/explore/_layout.js
import { Stack } from 'expo-router';
export default function ExploreLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="services/[id]" options={{ title: 'Service Details' }} />
      <Stack.Screen name="payment" options={{ title: 'Complete Booking', presentation: 'modal' }} />
      <Stack.Screen name="add-service-review" options={{ title: 'Review Service', presentation: 'modal' }} />
    </Stack>
  );
}