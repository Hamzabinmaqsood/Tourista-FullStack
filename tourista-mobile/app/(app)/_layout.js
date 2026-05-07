// In app/(app)/_layout.js (FINAL, CORRECTED VERSION)
import React, { useState, useEffect } from 'react';
import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import api from '../../src/services/api';
import { ActivityIndicator, View } from 'react-native';

export default function AppLayout() {
  const { authState } = useAuth();
  const [isVendor, setIsVendor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkVendorStatus = async () => {
      if (authState.authenticated && !authState.isGuest) {
        try {
          const response = await api.get('/api/auth/profile/');
          setIsVendor(response.data.vendor_profile?.is_verified || false);
        } catch (error) { console.error("Could not check vendor status", error); } 
        finally { setIsLoading(false); }
      } else {
        setIsLoading(false);
      }
    };
    checkVendorStatus();
  }, [authState.authenticated, authState.isGuest]);

  if (!authState.authenticated) {
    return <Redirect href="/login" />;
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary
      }}
    >
      {/* --- VISIBLE TABS --- */}
      {/* These now correctly point to the FOLDERS. The nested layouts inside
          each folder will handle their own child screens. */}
      <Tabs.Screen
        name="home" // Refers to the 'home' FOLDER
        options={{
          title: 'For You',
          // href: !isVendor ? '/home' : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore" // Refers to the 'explore' FOLDER
        options={{
          title: 'Explore',
          // href: !isVendor ? '/explore' : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="search-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vendor" // Refers to the 'vendor' FOLDER
        options={{
          title: 'Dashboard',
          href: isVendor ? '/vendor' : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="business-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="trips" // Refers to the 'trips' FOLDER
        options={{
          title: 'My Trips',
          tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages" // Refers to the 'messages' FOLDER
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile" // Refers to the 'profile' FOLDER
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />,
        }}
      />

      {/* --- HIDDEN ROUTES --- */}
      {/* THIS IS THE FIX: We REMOVE all references to nested screens like 'trips/[id]'
          because their parent layouts are now responsible for them. */}
      <Tabs.Screen name="destinations" options={{ href: null }} />
      <Tabs.Screen name="translator" options={{ href: null }} />
    </Tabs>
  );
}