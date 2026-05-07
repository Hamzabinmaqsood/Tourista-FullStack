// In app/(app)/vendor/manage-service.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity, Switch, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../../src/services/api';
import { COLORS } from '../../../constants/theme';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const SERVICE_TYPES = ['HOTEL', 'GUIDE', 'TRANSPORT'];

export default function ManageServiceScreen() {
  const router = useRouter();
  const { service: serviceString } = useLocalSearchParams();
  const existingService = serviceString ? JSON.parse(serviceString) : null;
  
  const [name, setName] = useState(existingService?.name || '');
  const [description, setDescription] = useState(existingService?.description || '');
  const [serviceType, setServiceType] = useState(existingService?.service_type || 'HOTEL');
  const [price, setPrice] = useState(existingService?.price || '');
  const [pricePer, setPricePer] = useState(existingService?.price_per || '');
  const [city, setCity] = useState(existingService?.city || '');
  const [isAvailable, setIsAvailable] = useState(existingService?.is_available ?? true);
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState(existingService?.cover_image || null);

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [16, 9], quality: 0.7 });
    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const handleSaveService = async () => {
    if (!name || !price || !pricePer || !city) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }
    setIsLoading(true);

    const serviceData = new FormData();
    serviceData.append('name', name);
    serviceData.append('description', description);
    serviceData.append('service_type', serviceType);
    serviceData.append('price', price);
    serviceData.append('price_per', pricePer);
    serviceData.append('city', city);
    serviceData.append('is_available', isAvailable);

    if (coverImage && !coverImage.startsWith('http')) {
      const filename = coverImage.split('/').pop();
      const type = `image/${filename.split('.').pop()}`;
      serviceData.append('cover_image', { uri: coverImage, name: filename, type });
    }

    try {
      const url = existingService ? `/api/vendors/my-services/${existingService.id}/` : '/api/vendors/my-services/';
      const method = existingService ? 'patch' : 'post';
      await api[method](url, serviceData, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert("Success", `Service has been saved!`, [{ text: "OK", onPress: () => router.back() }]);
    } catch (error) {
      console.error("Failed to save service:", error.response?.data || error);
      Alert.alert("Save Failed", "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteService = async () => {
    Alert.alert(
      "Delete Service",
      "Are you sure you want to permanently delete this service? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
            setIsLoading(true);
            try {
              await api.delete(`/api/vendors/my-services/${existingService.id}/`);
              Alert.alert("Deleted", "Service has been removed.", [{ text: "OK", onPress: () => router.back() }]);
            } catch (error) {
              console.error("Failed to delete service:", error);
              Alert.alert("Delete Failed", "Could not remove the service.");
            } finally {
              setIsLoading(false);
            }
          } 
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView style={styles.container}>
        <Text style={styles.label}>Cover Image</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={32} color={COLORS.textSecondary} />
              <Text>Tap to select an image</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <Text style={styles.label}>Service Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
        
        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline />

        <Text style={styles.label}>Service Type</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={serviceType} onValueChange={(itemValue) => setServiceType(itemValue)}>
            {SERVICE_TYPES.map(type => <Picker.Item key={type} label={type.charAt(0) + type.slice(1).toLowerCase()} value={type} />)}
          </Picker>
        </View>
        
        <View style={styles.row}>
          <View style={{flex: 1, marginRight: 10}}>
            <Text style={styles.label}>Price (Rs)</Text>
            <TextInput style={styles.input} value={String(price)} onChangeText={setPrice} keyboardType="numeric" />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.label}>Per</Text>
            <TextInput style={styles.input} value={pricePer} onChangeText={setPricePer} />
          </View>
        </View>
        
        <Text style={styles.label}>City</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} />

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Is Available?</Text>
          <Switch trackColor={{ false: "#767577", true: COLORS.primary }} thumbColor={"#f4f3f4"} onValueChange={setIsAvailable} value={isAvailable} />
        </View>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveService} disabled={isLoading}>
          <Text style={styles.saveButtonText}>{isLoading ? 'Saving...' : 'Save Service'}</Text>
        </TouchableOpacity>
        
        {existingService && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteService} disabled={isLoading}>
            <Text style={styles.deleteButtonText}>Delete Service</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: COLORS.card, borderRadius: 8, padding: 15, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 20 },
  textArea: { height: 120, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  pickerContainer: { backgroundColor: COLORS.card, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 20 },
  switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10, padding: 15, backgroundColor: COLORS.card, borderRadius: 8 },
  saveButton: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  deleteButton: { marginTop: 15, padding: 15, borderRadius: 10, alignItems: 'center' },
  deleteButtonText: { color: COLORS.error, fontSize: 16, fontWeight: '500' },
  imagePicker: { height: 200, width: '100%', backgroundColor: '#e9e9e9', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  imagePlaceholder: { alignItems: 'center' },
  coverImage: { width: '100%', height: '200%', borderRadius: 10 },
});