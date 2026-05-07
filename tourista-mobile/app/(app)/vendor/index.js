// In app/(app)/vendor/index.js
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Switch } from 'react-native';
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import api from '../../../src/services/api';
import { COLORS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

// Reusable card for displaying stats
const StatCard = ({ icon, label, value }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={28} color={COLORS.primary} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// MyServiceCard is now interactive with a live toggle
const MyServiceCard = ({ item, onPress, onToggleAvailability }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardType}>{item.service_type}</Text>
      <Text style={styles.cardPrice}>Rs {item.price}</Text>
    </View>
    <Switch
      trackColor={{ false: "#ccc", true: COLORS.primary + '80' }}
      thumbColor={item.is_available ? COLORS.primary : "#f4f3f4"}
      onValueChange={onToggleAvailability}
      value={item.is_available}
    />
  </TouchableOpacity>
);

export default function VendorDashboard() {
  const router = useRouter();
  const [allServices, setAllServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ totalBookings: 0, monthlyRevenue: "0.00", activeServices: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all', 'active', 'inactive'

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [servicesRes, statsRes] = await Promise.all([
            api.get('/api/vendors/my-services/'),
            api.get('/api/vendors/my-stats/')
          ]);
          setAllServices(servicesRes.data);
          setStats(statsRes.data);
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [])
  );

  const handleToggleAvailability = async (serviceId, newValue) => {
    setAllServices(prevServices =>
      prevServices.map(service =>
        service.id === serviceId ? { ...service, is_available: newValue } : service
      )
    );
    try {
      await api.patch(`/api/vendors/my-services/${serviceId}/`, { is_available: newValue });
    } catch (error) {
      console.error("Failed to update availability:", error);
      setAllServices(prevServices =>
        prevServices.map(service =>
          service.id === serviceId ? { ...service, is_available: !newValue } : service
        )
      );
      alert("Failed to update service status.");
    }
  };

  const filteredServices = useMemo(() => {
    let services = allServices;
    if (availabilityFilter === 'active') {
      services = services.filter(s => s.is_available);
    } else if (availabilityFilter === 'inactive') {
      services = services.filter(s => !s.is_available);
    }
    if (searchQuery) {
      services = services.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return services;
  }, [allServices, availabilityFilter, searchQuery]);

  if (isLoading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={styles.centeredContainer} />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: 'My Dashboard',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/vendor/manage-service')} style={{ marginRight: 15 }}>
              <Ionicons name="add-circle" size={32} color={COLORS.primary} />
            </TouchableOpacity>
          )
        }}
      />
      <View style={styles.statsContainer}>
        <StatCard icon="receipt-outline" label="Total Bookings" value={stats.totalBookings} />
        <StatCard icon="cash-outline" label="Revenue (30d)" value={`Rs ${stats.monthlyRevenue}`} />
        <StatCard icon="checkmark-circle-outline" label="Active Services" value={stats.activeServices} />
      </View>
      
      <Text style={styles.subHeader}>Manage Services</Text>

      <View style={styles.controlsContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search my services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.filterToggles}>
          <TouchableOpacity onPress={() => setAvailabilityFilter('all')} style={[styles.toggleButton, availabilityFilter === 'all' && styles.activeToggleButton]}>
            <Text style={[styles.toggleText, availabilityFilter === 'all' && styles.activeToggleText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAvailabilityFilter('active')} style={[styles.toggleButton, availabilityFilter === 'active' && styles.activeToggleButton]}>
            <Text style={[styles.toggleText, availabilityFilter === 'active' && styles.activeToggleText]}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAvailabilityFilter('inactive')} style={[styles.toggleButton, availabilityFilter === 'inactive' && styles.activeToggleButton]}>
            <Text style={[styles.toggleText, availabilityFilter === 'inactive' && styles.activeToggleText]}>Inactive</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredServices}
        renderItem={({ item }) => 
          <MyServiceCard 
            item={item} 
            onPress={() => router.push({ pathname: '/vendor/manage-service', params: { service: JSON.stringify(item) }})}
            onToggleAvailability={(newValue) => handleToggleAvailability(item.id, newValue)}
          />
        }
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={60} color="#AEB8C4" />
            <Text style={styles.emptyTitle}>No Services Found</Text>
            <Text style={styles.emptySubtitle}>Tap the '+' icon to add your first service or adjust your filters.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 15 },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  subHeader: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 15, marginTop: 10 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingTop: 10 },
  statCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 10, padding: 15, alignItems: 'center', marginHorizontal: 5, elevation: 2 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginTop: 8 },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  controlsContainer: { marginBottom: 15 },
  searchInput: { height: 45, backgroundColor: COLORS.card, borderRadius: 8, paddingHorizontal: 15, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 10 },
  filterToggles: { flexDirection: 'row', backgroundColor: '#e9e9e9', borderRadius: 8, padding: 4 },
  toggleButton: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  activeToggleButton: { backgroundColor: COLORS.card, elevation: 1 },
  toggleText: { fontWeight: '600', color: COLORS.textSecondary },
  activeToggleText: { color: COLORS.primary },
  card: { backgroundColor: COLORS.card, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  cardType: { fontSize: 14, color: COLORS.textSecondary, textTransform: 'capitalize', marginTop: 4 },
  cardPrice: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginTop: 8 },
  emptyContainer: { alignItems: 'center', marginTop: '20%' },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginTop: 20 },
  emptySubtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },
});