// In app/(app)/profile/vendor-apply.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../../src/services/api';
import { COLORS } from '../../../constants/theme';

export default function VendorApplyScreen() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitApplication = async () => {
    if (!businessName || !phone) {
      Alert.alert("Missing Information", "Please enter your business name and contact phone.");
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/api/vendors/register/', {
        business_name: businessName,
        contact_phone: phone,
        business_description: description,
      });
      
      Alert.alert(
        "Application Submitted",
        "Thank you for applying! Your application is now pending review by our team.",
        [{ text: "OK", onPress: () => router.back() }]
      );

    } catch (error) {
      console.error("Failed to submit application:", error.response?.data || error);
      Alert.alert("Submission Failed", error.response?.data?.error || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Vendor Application</Text>
      <Text style={styles.subtitle}>Join our network of local service providers.</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Business Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Hunza Paradise Hotel"
          value={businessName}
          onChangeText={setBusinessName}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Contact Phone</Text>
        <TextInput
          style={styles.input}
          placeholder="Your business phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Business Description (Optional)</Text>
        <TextInput
          style={[styles.input, { height: 120, textAlignVertical: 'top', paddingTop: 15 }]}
          placeholder="Tell tourists about your business."
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, isLoading && { backgroundColor: COLORS.textSecondary }]}
        onPress={handleSubmitApplication}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>{isLoading ? "Submitting..." : "Submit Application"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 30 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});