// In app/(app)/profile/_layout.js
import { Stack } from 'expo-router';
export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="edit" options={{ title: 'Edit Profile', presentation: 'modal' }} />
      <Stack.Screen name="favorites" options={{ title: 'My Favorites' }} />
      <Stack.Screen name="vendor-apply" options={{ title: 'Become a Vendor', presentation: 'modal' }} />
    </Stack>
  );
}