// In app/(app)/profile/edit.js
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity,LayoutAnimation, UIManager, Platform,KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../../src/services/api';
import { COLORS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import ModalDropdown from 'react-native-modal-dropdown';

// Define the valid travel styles that match the backend
const TRAVEL_STYLES = ['ADVENTURE', 'RELAXATION', 'CULTURAL', 'FAMILY', 'BUDGET'];


export default function EditProfileScreen() {
  const router = useRouter();
  const { initialProfile } = useLocalSearchParams();
  const profileData = JSON.parse(initialProfile);

  const [travelStyle, setTravelStyle] = useState(profileData.profile.travel_style || 'RELAXATION');
  const [budget, setBudget] = useState(profileData.profile.budget || '');
  const [languages, setLanguages] = useState(profileData.profile.preferred_languages || '');
  const [isLoading, setIsLoading] = useState(false);
  

  
  const dropdownRef = useRef(null);
  const [bio, setBio] = useState(profileData.profile.bio || '');
  

  const handleSaveChanges = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
  // 1. Input Validation
  const numericBudget = parseFloat(budget);
  if (budget && (isNaN(numericBudget) || numericBudget <= 0)) {
    Alert.alert("Invalid Input", "Daily budget must be a positive number.");
    return;
  }

  setIsLoading(true);
  try {
    // 2. Send the PATCH request with all profile data
    await api.patch('/api/auth/profile/', {
      profile: {
        travel_style: travelStyle,
        budget: budget ? numericBudget : null,
        preferred_languages: languages.trim(),
        bio: bio.trim(), // Include the bio
      }
    });

    // 3. Show a success message and navigate back
    Alert.alert("Profile Updated", "Your preferences have been saved successfully.", [
      { text: "OK", onPress: () => router.back() }
    ]);

  } catch (error) {
    console.error("Failed to update profile:", error.response?.data || error);
    Alert.alert("Error", "Could not update your profile.");
  } finally {
      // --- ADD THIS LINE HERE AS WELL ---
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsLoading(false);
    }
};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* 1. Dropdown for Travel Style */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Primary Travel Style</Text>
        <ModalDropdown
  ref={dropdownRef}
  options={TRAVEL_STYLES}
  defaultIndex={TRAVEL_STYLES.indexOf(travelStyle)}
  defaultValue={travelStyle.charAt(0) + travelStyle.slice(1).toLowerCase()}
  onSelect={(index, value) => setTravelStyle(value)}
  style={styles.dropdown}
  textStyle={styles.dropdownText}
  dropdownStyle={styles.dropdownStyle}
  // The renderRow prop is removed. We will style the rows directly.
/>
        <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} style={styles.dropdownIcon} onPress={() => dropdownRef.current.show()}/>
      </View>

      {/* 2. Numeric Keyboard for Budget */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Daily Budget (Rs)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 15000"
          value={String(budget)}
          onChangeText={setBudget}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Preferred Languages</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., English, Urdu"
          value={languages}
          onChangeText={setLanguages}
        />
      </View>

      <View style={styles.formGroup}>
    <Text style={styles.label}>Your Bio</Text>
    <TextInput
      style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: 15 }]}
      placeholder="A short intro about your travel interests."
      value={bio}
      onChangeText={setBio}
      maxLength={150}
      multiline={true}
    />
    {/* ADD THIS NEW FORM GROUP for the Bio */}
    <Text style={styles.charCount}>{150 - bio.length} remaining</Text>
  </View>

      <TouchableOpacity 
        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
        onPress={handleSaveChanges}
        disabled={isLoading}
      >
        <Text style={styles.saveButtonText}>{isLoading ? "Saving..." : "Save Changes"}</Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  contentContainer: { padding: 20 },
  formGroup: { marginBottom: 25 },
  label: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 10, fontWeight: '500' },
  input: {
    height: 50,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  // Dropdown styles
  dropdown: {
    height: 50,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.text,
  },
  dropdownStyle: {
    width: '90%',
    borderRadius: 8,
    marginTop: 10,
    elevation: 3,
  },
  dropdownRow: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  dropdownRowSelected: {
    backgroundColor: COLORS.primary + '20', // Primary color with low opacity
  },
  dropdownRowText: {
    fontSize: 16,
  },
  dropdownIcon: {
    position: 'absolute',
    right: 15,
    top: 42,
  },
  // Save Button
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 5,
  }
});