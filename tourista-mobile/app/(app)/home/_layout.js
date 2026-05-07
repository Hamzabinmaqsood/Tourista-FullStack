// In app/(app)/home/_layout.js
import { Stack } from 'expo-router';
export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="ai-chat" options={{ title: 'AI Assistant' }} />
      <Stack.Screen name="add-to-trip" options={{ title: 'Add to Trip', presentation: 'modal' }} />
    </Stack>
  );
}