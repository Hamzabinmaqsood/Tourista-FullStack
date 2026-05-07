// In app/(app)/vendors/_layout.js
import { Stack } from 'expo-router';
export default function VendorLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'My Dashboard' }} />
      <Stack.Screen name="manage-service" options={{ title: 'Manage Service', presentation: 'modal' }} />
    </Stack>
  );
}