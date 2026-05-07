// app/(app)/trip/select-destination.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

// ✅ 60+ top destinations across Pakistan
const POPULAR_DESTINATIONS = [
  // Northern Areas
  { id: 1, name: 'Hunza Valley', region: 'Gilgit-Baltistan' },
  { id: 2, name: 'Skardu', region: 'Gilgit-Baltistan' },
  { id: 3, name: 'Naran & Kaghan', region: 'Khyber Pakhtunkhwa' },
  { id: 4, name: 'Fairy Meadows', region: 'Gilgit-Baltistan' },
  { id: 5, name: 'Khunjerab Pass', region: 'Gilgit-Baltistan' },
  { id: 6, name: 'Attabad Lake', region: 'Gilgit-Baltistan' },
  { id: 7, name: 'Passu Cones', region: 'Gilgit-Baltistan' },
  { id: 8, name: 'Rama Lake', region: 'Gilgit-Baltistan' },
  { id: 9, name: 'Deosai Plains', region: 'Gilgit-Baltistan' },
  { id: 10, name: 'Baltit Fort', region: 'Hunza, Gilgit-Baltistan' },
  { id: 11, name: 'Altit Fort', region: 'Hunza, Gilgit-Baltistan' },
  { id: 12, name: 'Hoper Glacier', region: 'Nagar, Gilgit-Baltistan' },

  // Khyber Pakhtunkhwa
  { id: 13, name: 'Swat Valley', region: 'Khyber Pakhtunkhwa' },
  { id: 14, name: 'Kalam Valley', region: 'Khyber Pakhtunkhwa' },
  { id: 15, name: 'Malam Jabba', region: 'Khyber Pakhtunkhwa' },
  { id: 16, name: 'Kumrat Valley', region: 'Khyber Pakhtunkhwa' },
  { id: 17, name: 'Dir Valley', region: 'Khyber Pakhtunkhwa' },
  { id: 18, name: 'Siri Paye', region: 'Shogran, Khyber Pakhtunkhwa' },
  { id: 19, name: 'Shogran', region: 'Khyber Pakhtunkhwa' },
  { id: 20, name: 'Saif-ul-Malook Lake', region: 'Khyber Pakhtunkhwa' },
  { id: 21, name: 'Chitral', region: 'Khyber Pakhtunkhwa' },
  { id: 22, name: 'Kalash Valley', region: 'Chitral, Khyber Pakhtunkhwa' },
  { id: 23, name: 'Takht-e-Bahi', region: 'Mardan, Khyber Pakhtunkhwa' },

  // Azad Kashmir
  { id: 24, name: 'Neelum Valley', region: 'Azad Kashmir' },
  { id: 25, name: 'Arang Kel', region: 'Neelum Valley, Azad Kashmir' },
  { id: 26, name: 'Sharda', region: 'Neelum Valley, Azad Kashmir' },
  { id: 27, name: 'Ratti Gali Lake', region: 'Azad Kashmir' },
  { id: 28, name: 'Banjosa Lake', region: 'Rawalakot, Azad Kashmir' },
  { id: 29, name: 'Toli Peer', region: 'Rawalakot, Azad Kashmir' },
  { id: 30, name: 'Leepa Valley', region: 'Azad Kashmir' },
  { id: 31, name: 'Bagh', region: 'Azad Kashmir' },
  { id: 32, name: 'Muzaffarabad', region: 'Azad Kashmir' },

  // Punjab
  { id: 33, name: 'Murree', region: 'Punjab' },
  { id: 34, name: 'Patriata (New Murree)', region: 'Punjab' },
  { id: 35, name: 'Lahore', region: 'Punjab' },
  { id: 36, name: 'Rawalpindi', region: 'Punjab' },
  { id: 37, name: 'Islamabad', region: 'Capital Territory' },
  { id: 38, name: 'Taxila', region: 'Punjab' },
  { id: 39, name: 'Multan', region: 'Punjab' },
  { id: 40, name: 'Bahawalpur', region: 'Punjab' },
  { id: 41, name: 'Derawar Fort', region: 'Cholistan Desert, Punjab' },
  { id: 42, name: 'Cholistan Desert', region: 'Punjab' },
  { id: 43, name: 'Katas Raj Temples', region: 'Chakwal, Punjab' },
  { id: 44, name: 'Rohtas Fort', region: 'Jhelum, Punjab' },

  // Sindh
  { id: 45, name: 'Karachi', region: 'Sindh' },
  { id: 46, name: 'Thatta', region: 'Sindh' },
  { id: 47, name: 'Makli Necropolis', region: 'Thatta, Sindh' },
  { id: 48, name: 'Keenjhar Lake', region: 'Sindh' },
  { id: 49, name: 'Manchar Lake', region: 'Sindh' },
  { id: 50, name: 'Ranikot Fort', region: 'Jamshoro, Sindh' },
  { id: 51, name: 'Mohenjo-Daro', region: 'Larkana, Sindh' },
  { id: 52, name: 'Sehwan Sharif', region: 'Sindh' },
  { id: 53, name: 'Haleji Lake', region: 'Sindh' },
  { id: 54, name: 'Karoonjhar Mountains', region: 'Tharparkar, Sindh' },

  // Balochistan
  { id: 55, name: 'Gwadar', region: 'Balochistan' },
  { id: 56, name: 'Ormara Beach', region: 'Balochistan' },
  { id: 57, name: 'Kund Malir Beach', region: 'Hingol, Balochistan' },
  { id: 58, name: 'Hingol National Park', region: 'Balochistan' },
  { id: 59, name: 'Princess of Hope', region: 'Hingol, Balochistan' },
  { id: 60, name: 'Ziarat', region: 'Balochistan' },
  { id: 61, name: 'Hanna Lake', region: 'Quetta, Balochistan' },
  { id: 62, name: 'Pir Ghaib Waterfall', region: 'Bolān, Balochistan' },
  { id: 63, name: 'Quetta', region: 'Balochistan' },
  { id: 64, name: 'Moola Chotok', region: 'Khuzdar, Balochistan' },
];

export default function SelectDestinationScreen() {
  const router = useRouter();
  const [destination, setDestination] = useState('');

  const handleSelect = (selectedDestination) => {
    router.push({
      pathname: '/trips/detailed-planner',
      params: { destinationName: selectedDestination }
    });
  };

  const filteredDestinations = destination
    ? POPULAR_DESTINATIONS.filter(item =>
        item.name.toLowerCase().includes(destination.toLowerCase())
      )
    : POPULAR_DESTINATIONS;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where are you going?</Text>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Enter a city or destination"
          value={destination}
          onChangeText={setDestination}
          onSubmitEditing={() => handleSelect(destination)}
        />
      </View>

      <Text style={styles.popularTitle}>
        {destination ? 'Search Results' : 'Popular Destinations'}
      </Text>

      <FlatList
        data={filteredDestinations}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.itemContainer} onPress={() => handleSelect(item.name)}>
            <Ionicons name="location-outline" size={24} color={COLORS.primary} />
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemRegion}>{item.region}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: 30 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 10, paddingHorizontal: 15, marginBottom: 30 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 16 },
  popularTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 15 },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemTextContainer: { flex: 1, marginLeft: 15 },
  itemName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  itemRegion: { fontSize: 12, color: COLORS.textSecondary },
});
