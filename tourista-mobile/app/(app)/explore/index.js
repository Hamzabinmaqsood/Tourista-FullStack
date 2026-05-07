// In app/(app)/explore.js
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity,Platform  } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../../src/services/api';
import { COLORS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const ServiceCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Text style={styles.cardTitle}>{item.name}</Text>
    <Text style={styles.cardVendor}>by {item.vendor.business_name}</Text>
    <View style={styles.footer}>
      <Text style={styles.serviceType}>{item.service_type}</Text>
      <Text style={styles.price}>Rs {item.price} <Text style={styles.pricePer}>/ {item.price_per}</Text></Text>
    </View>
  </TouchableOpacity>
);

export default function ExploreScreen() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
  const fetchServices = async () => {
    try {
      const response = await api.get('/api/vendors/services/all/');
      setServices(response.data);
    } catch (error) {
      console.log("Failed to fetch services:", error);
    } finally {
      setIsLoading(false);
    }
  };
  fetchServices();
}, []);



  const filteredServices = useMemo(() => {
    if (!searchQuery) return services;
    return services.filter(service => 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.vendor.business_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [services, searchQuery]);

  if (isLoading) {
    return ( <ActivityIndicator size="large" color={COLORS.primary} style={styles.centeredContainer} /> );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Explore Services</Text>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for hotels, guides..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredServices}
        renderItem={({ item }) => (
          <ServiceCard 
            item={item} 
            // THIS IS THE CORRECTED PATH 
            onPress={() => router.push(`/explore/services/${item.id}`)} 
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No services found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingTop: 50,
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  card: {
    backgroundColor: COLORS.card,
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
    color: COLORS.text,
  },
  cardVendor: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  serviceType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  pricePer: {
    fontSize: 12,
    fontWeight: 'normal',
    color: COLORS.textSecondary,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: COLORS.textSecondary,
  },
});