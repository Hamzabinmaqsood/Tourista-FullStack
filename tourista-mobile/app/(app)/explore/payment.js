// In app/(app)/explore/payment.js
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';

const REDIRECT_URL = "https://yourapp.com/payment-success/"; // Must match the redirect_url in the backend

export default function PaymentScreen() {
  const { payment_url } = useLocalSearchParams();
  const router = useRouter();

  const handleNavigationStateChange = (navState) => {
    // Check if the WebView has been redirected to our success URL
    if (navState.url.includes(REDIRECT_URL)) {
      // Payment is complete, go back to the app
      router.back();
      // Optionally, navigate to the bookings tab
      router.push({ pathname: '/trips', params: { initialTab: 'bookings' } });
    }
  };

  return (
    <WebView
      source={{ uri: payment_url }}
      onNavigationStateChange={handleNavigationStateChange}
      startInLoadingState={true}
      renderLoading={() => <ActivityIndicator size="large" style={{flex: 1}} />}
    />
  );
}