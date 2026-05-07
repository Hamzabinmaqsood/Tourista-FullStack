// app/(app)/trips/customize-trip.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { COLORS } from "../../../constants/theme";
import api from "../../../src/services/api";

export default function CustomizeTripScreen() {
  const { itinerary } = useLocalSearchParams();
  const router = useRouter();

  const [tripData, setTripData] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingBudgetDetails, setLoadingBudgetDetails] = useState(false);

  // 🟢 Parse and normalize itinerary
  useEffect(() => {
    if (itinerary) {
      try {
        const parsed = JSON.parse(itinerary);
        const normalized = {
          destination: parsed.destination || parsed.destinationName || "Unknown Destination",
          duration: parsed.duration || parsed.days || "N/A",
          budget: parsed.budget || parsed.budgetRange || "N/A",
          style: parsed.style || parsed.travelStyle || "N/A",
          accommodation: parsed.accommodation || parsed.accommodations || "N/A",
          transportation: parsed.transportation || parsed.transport || "N/A",
        };
        setTripData(normalized);
      } catch (e) {
        console.error("Failed to parse itinerary:", e);
      }
    }
  }, [itinerary]);

  // 🟢 Fetch budget estimate
  useEffect(() => {
    const fetchBudget = async () => {
      if (!tripData) return;
      try {
        const response = await api.post("/api/planner/estimate-budget/", {
          destination: tripData.destination,
          preferences: {
            duration: tripData.duration,
            budget_style: tripData.budget,
            travel_style: tripData.style,
            accommodation: tripData.accommodation,
            transportation: tripData.transportation,
          },
        });
        setBudgetData(response.data);
      } catch (error) {
        console.error("Budget fetch failed:", error.response?.data || error);
        Alert.alert("Error", "Failed to fetch budget estimation.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBudget();
  }, [tripData]);

  // 🟢 Handle Budget Details
  const handleBudgetDetails = async () => {
    if (!budgetData) {
      Alert.alert("No Budget Data", "Please generate a budget first.");
      return;
    }

    try {
      setLoadingBudgetDetails(true);

      // Fetch detailed breakdown from backend
      const response = await api.post("/api/planner/budget-details/", {
        destination: tripData.destination,
        preferences: {
          duration: tripData.duration,
          budget_style: tripData.budget,
          travel_style: tripData.style,
          accommodation: tripData.accommodation,
          transportation: tripData.transportation,
        },
      });

      const detailedBudget = response.data;
      // console.log("🔥 Detailed Budget Data:", detailedBudget);

      router.push({
        pathname: "/trips/budget-details",
        params: {
          data: encodeURIComponent(JSON.stringify(detailedBudget)),
        },
      });
    } catch (error) {
      console.error("Failed to load detailed budget:", error);
      Alert.alert("Error", "Could not load detailed budget data.");
    } finally {
      setLoadingBudgetDetails(false);
    }
  };

  if (!tripData) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: COLORS.text }}>No trip data found.</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.text }}>
          Planning your trip...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{tripData.destination}</Text>
        <Text style={styles.subText}>Your Customized Travel Plan</Text>

        <View style={styles.detailBox}>
          <Text style={styles.label}>Duration:</Text>
          <Text style={styles.value}>{tripData.duration}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.label}>Budget Style:</Text>
          <Text style={styles.value}>{tripData.budget}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.label}>Travel Style:</Text>
          <Text style={styles.value}>{tripData.style}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.label}>Accommodation:</Text>
          <Text style={styles.value}>{tripData.accommodation}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.label}>Transport:</Text>
          <Text style={styles.value}>{tripData.transportation}</Text>
        </View>

        {budgetData && (
          <>
            <View style={styles.divider} />
            <Text style={styles.budgetLabel}>Estimated Total Budget:</Text>
            <Text style={styles.budgetValue}>
              PKR {budgetData.total_budget_pkr?.toLocaleString() || "N/A"}
            </Text>
          </>
        )}

        <TouchableOpacity
  style={[styles.button, { backgroundColor: COLORS.primary }]}
  onPress={() => {
    if (!budgetData) {
      Alert.alert("No Budget Data", "Please generate a budget first.");
      return;
    }

    router.push({
      pathname: "/trips/budget-details",
      params: {
        data: encodeURIComponent(JSON.stringify(budgetData)),
      },
    });
  }}
>
  <Text style={styles.buttonText}>🧾 Budget Details</Text>
</TouchableOpacity>


        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.secondary }]}
          onPress={() =>
            Alert.alert("Trip Saved!", "Your trip has been added to your dashboard.")
          }
        >
          <Text style={styles.buttonText}>💾 Save & Start Trip</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
  },
  subText: {
    textAlign: "center",
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  detailBox: { flexDirection: "row", justifyContent: "space-between", marginVertical: 5 },
  label: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  value: { fontSize: 16, color: COLORS.textSecondary },
  divider: { height: 1, backgroundColor: "#ddd", marginVertical: 15 },
  budgetLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  budgetValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
