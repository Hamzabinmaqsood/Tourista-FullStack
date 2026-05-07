// In app/(app)/profile/index.js
import React, { useState, useCallback,useMemo  } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, Alert, ImageBackground,Platform  } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../src/services/api';
import { COLORS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';


const ProgressTracker = ({ profile }) => {
  const score = useMemo(() => {
    let completed = 0;
    const totalFields = 4;
    if (profile.bio) completed++;
    if (profile.avatar) completed++;
    if (profile.budget) completed++;
    if (profile.travel_style) completed++;
    return Math.round((completed / totalFields) * 100);
  }, [profile]);

  const getPrompt = () => {
    if (score === 100) return "Profile is complete!";
    if (!profile.avatar) return "Add a profile picture for a personal touch.";
    if (!profile.bio) return "Add a bio to share your travel interests.";
    if (!profile.budget) return "Set a budget for tailored recommendations.";
    return "Complete your profile for better suggestions.";
  };

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Profile Completion</Text>
        <Text style={styles.progressScore}>{score}%</Text>
      </View>
      <View style={styles.progressBarBackground}>
        {/* CORRECTED SYNTAX for dynamic style */}
        <View style={[styles.progressBarFill, { width: `${score}%` }]} />
      </View>
      <Text style={styles.progressPrompt}>{getPrompt()}</Text>
    </View>
  );
};
// Reusable component for the quick action buttons
const ActionButton = ({ icon, label, onPress, tooltip }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress} onLongPress={() => Alert.alert(label, tooltip)}>
    <Ionicons name={icon} size={28} color={COLORS.primary} />
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

// Reusable component for the preference cards
const PreferenceCard = ({ icon, value }) => (
  <View style={styles.preferenceCard}>
    <Ionicons name={icon} size={24} color={COLORS.secondary} />
    <Text style={styles.preferenceText}>{value}</Text>
  </View>
);

export default function ProfileScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isVendor = profile && profile.vendor_profile;

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/auth/profile/');
      setProfile(response.data);
    } catch (error) { console.error("Failed to fetch profile:", error); } 
    finally { setIsLoading(false); }
  };

  // useFocusEffect will refetch the data every time the user comes back to this screen
  // useFocusEffect(useCallback(() => {
  //   fetchProfile();
  // }, []));
  useFocusEffect(useCallback(() => { setIsLoading(true); fetchProfile(); }, []));

  const handleLogout = () => {
    // 7. Add confirmation modal before logout
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: logout }
    ]);
  };

  const handleAvatarChange = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Permission to access camera roll is required to change your avatar.");
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (pickerResult.canceled) return;
    
    const uri = pickerResult.assets[0].uri;
    const filename = uri.split('/').pop();
    const type = `image/${filename.split('.').pop()}`;
    const formData = new FormData();
    formData.append('profile.avatar', { uri, name: filename, type });
    
    try {
      setIsLoading(true);
      const response = await api.patch('/api/auth/profile/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile(response.data);
    } catch (error) {
      console.error("Avatar upload failed:", error.response?.data || error);
      Alert.alert("Upload Failed", "Could not update profile picture.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;
  if (!profile) return <Text style={styles.errorText}>Could not load profile.</Text>;

  return (
    <ScrollView style={styles.container}>
      {/* 1. Header with Blurred Background */}
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070' }} 
        style={styles.header}
        blurRadius={10}
      >
        <View style={styles.headerOverlay} />
        <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarChange}>
          <Image 
            source={profile.profile.avatar ? { uri: profile.profile.avatar } : require('../../../assets/images/default-avatar.png')} 
            style={styles.avatar} 
          />
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera-outline" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </ImageBackground>

      {/* --- User Info --- */}
      <View style={styles.userInfo}>
        {/* THIS IS THE FIX: Display the username prominently */}
        <Text style={styles.username}>{profile.username}</Text>
        <Text style={styles.bio}>{profile.profile.bio || "No bio yet. Tap 'Edit Profile' to add one."}</Text>
      </View>
      {/* Insert the ProgressTracker component */}
      {/* <ProgressTracker profile={profile.profile} />   */}
      
      {/* Use the dynamic data from the profile object */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="airplane" size={20} color={COLORS.primary} />
          <Text style={styles.statText}>{profile.trips_completed} Trips Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="globe" size={20} color={COLORS.primary} />
          <Text style={styles.statText}>{profile.countries_visited} Countries Visited</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <ActionButton icon="pencil-outline" label="Edit Profile" tooltip="Change your travel style and budget" onPress={() => router.push({ pathname: '/profile/edit', params: { initialProfile: JSON.stringify(profile) }})} />
        <ActionButton icon="briefcase-outline" label="Bookings" tooltip="View your past service bookings" onPress={() => router.push({ pathname: '/trips', params: { initialTab: 'bookings' } })} />
        <ActionButton icon="heart-outline" label="Favorites" tooltip="See your saved destinations and services" onPress={() => router.push('/profile/favorites')} />
       <ActionButton icon="chatbubbles-outline" label="Messages" onPress={() => router.push('/messages')} 
  />
      </View>

      {/* 5. Travel Preferences as Cards */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>My Travel Style</Text>
        <View style={styles.preferencesRow}>
          <PreferenceCard icon="compass-outline" value={profile.profile.travel_style || 'Not set'} />
          <PreferenceCard icon="wallet-outline" value={profile.profile.budget ? `Rs ${profile.profile.budget}` : 'Not set'} />
          <PreferenceCard icon="language-outline" value={profile.profile.preferred_languages || 'Not set'} />
        </View>
      </View>

      {/* Only show this button if the user is NOT a vendor */}
      {!isVendor && (
        <TouchableOpacity style={styles.vendorButton} onPress={() => router.push('/profile/vendor-apply')}>
          <Ionicons name="briefcase-outline" size={24} color={COLORS.card} />
          <Text style={styles.vendorButtonText}>Become a Vendor</Text>
        </TouchableOpacity>
      )}
      
      {/* Logout Button*/}
      <TouchableOpacity style={styles.settingsRow} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
        <Text style={[styles.settingsText, { color: COLORS.error }]}>Log Out</Text>
      </TouchableOpacity>

      
  
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorText: {
    textAlign: 'center',
    marginTop: '50%',
    color: COLORS.error,
    fontSize: 16,
  },
  // Header styles
  header: {
    height: 180,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -50, // Lifts the avatar to sit halfway over the header bottom
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.card, // A clean white border
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  // User Info
  userInfo: { alignItems: 'center', marginTop: 60, marginBottom: 20 },
  username: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  bio: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  statText: {
    marginLeft: 5,
    color: COLORS.primary,
    fontWeight: '600',
  },
  // Actions
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionLabel: {
    marginTop: 5,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  // Card for Preferences
  card: {
    backgroundColor: COLORS.card,
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    // --- Polished Shadow/Elevation ---
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4.00,
    elevation: 3,
    borderWidth: Platform.OS === 'android' ? 0 : 1,
    borderColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.text,
  },
  preferencesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  preferenceCard: {
    alignItems: 'center',
    flex: 1,
  },
  preferenceText: {
    marginTop: 5,
    color: COLORS.secondary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  // Settings & Logout Card
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 15,
    borderRadius: 12,
    marginBottom: 20, // Final margin at the bottom of the scroll view
    // --- Polished Shadow/Elevation ---
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4.00,
    elevation: 3,
    borderWidth: Platform.OS === 'android' ? 0 : 1,
    borderColor: '#f0f0f0',
  },
  settingsText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: COLORS.error,
    fontWeight: '500',
  },
  vendorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 15,
    marginHorizontal: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  vendorButtonText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
//Stats
  progressCard: { backgroundColor: COLORS.card, marginHorizontal: 15, borderRadius: 12, padding: 20, marginBottom: 20, elevation: 2 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  progressScore: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  progressBarBackground: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  progressPrompt: { fontSize: 12, color: COLORS.textSecondary, fontStyle: 'italic' },
});