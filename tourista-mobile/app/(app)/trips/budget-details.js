// app/(app)/trips/budget-details.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { COLORS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

// Enable layout animation on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const BudgetItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  const ICONS = {
    Accommodation: 'bed-outline',
    Hotel: 'bed-outline',
    Food: 'restaurant-outline',
    Transport: 'car-sport-outline',
    Activities: 'walk-outline',
    Miscellaneous: 'cash-outline',
    Other: 'wallet-outline',
  };

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity onPress={toggleExpand} activeOpacity={0.8}>
      <View style={styles.itemCard}>
        <Ionicons
          name={ICONS[item.category] || 'cash-outline'}
          size={28}
          color={COLORS.primary}
        />
        <View style={styles.itemContent}>
          <Text style={styles.itemCategory}>{item.category}</Text>
          {expanded && (
            <Text style={styles.itemDescription}>{item.description}</Text>
          )}
        </View>
        <Text style={styles.itemCost}>
          Rs {Number(item.cost_pkr).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function BudgetDetailsScreen() {
  const { budget: budgetString } = useLocalSearchParams();
  const budget = JSON.parse(budgetString);
  // console.log('🔥 Budget Data Received:', budget);

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: `Budget for ${budget.destination}` }} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.totalLabel}>Total Estimated Budget</Text>
        <Text style={styles.totalValue}>
          Rs {budget.total_budget_pkr.toLocaleString()}
        </Text>
      </View>

      {/* Breakdown Section */}
      {budget.breakdown && budget.breakdown.length > 0 ? (
        <>
          <Text style={styles.breakdownTitle}>Budget Breakdown</Text>
          {budget.breakdown.map((item, index) => (
            <BudgetItem key={index} item={item} />
          ))}
        </>
      ) : (
        <View style={styles.emptyBreakdown}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={COLORS.textSecondary}
          />
          <Text style={styles.emptyText}>No detailed breakdown available.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, padding: 30, alignItems: 'center' },
  totalLabel: { fontSize: 18, color: '#fff', opacity: 0.85 },
  totalValue: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  breakdownTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, padding: 20 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 20,
    borderRadius: 14,
    elevation: 3,
  },
  itemContent: { flex: 1, marginLeft: 15 },
  itemCategory: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  itemDescription: { fontSize: 14, color: COLORS.textSecondary, marginTop: 5 },
  itemCost: { fontSize: 16, fontWeight: 'bold', color: COLORS.secondary },
  emptyBreakdown: {
    alignItems: 'center',
    marginTop: 30,
  },
  emptyText: { marginTop: 10, color: COLORS.textSecondary },
});
