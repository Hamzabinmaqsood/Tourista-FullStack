// In app/(app)/messages/_layout.js
import { Stack } from 'expo-router';
export default function MessagesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'My Messages' }} />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}