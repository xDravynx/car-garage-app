import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getCars, deleteCar } from "../services/carApi";
import { colors } from "../theme/colors";

export default function GarageScreen({ navigation }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchInventory = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await getCars();
      setCars(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchInventory(false);
    }, [fetchInventory])
  );

  function confirmDelete(car) {
    Alert.alert(
      "Remove Vehicle",
      `Delete ${car.year} ${car.make} ${car.model}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCar(car._id);
              setCars((prev) => prev.filter((item) => item._id !== car._id));
            } catch (err) {
              Alert.alert("Error", err.message);
            }
          },
        },
      ]
    );
  }

  function renderCarItem({ item }) {
    return (
      <View style={styles.card}>
        <Text style={styles.year}>{item.year}</Text>
        <Text style={styles.title}>
          {item.make} {item.model}
        </Text>
        {typeof item.price === "number" && (
          <Text style={styles.price}>${item.price.toLocaleString()}</Text>
        )}
        {item.created_at && (
          <Text style={styles.meta}>
            Added {new Date(item.created_at).toLocaleDateString()}
          </Text>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate("EditCar", { carId: item._id })}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => confirmDelete(item)}
          >
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.statusText}>Loading garage inventory...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.heading}>Garage Inventory</Text>
          <Text style={styles.count}>{cars.length} Vehicles</Text>
        </View>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate("AddCar")}
        >
          <Text style={styles.primaryBtnText}>+ Add Car</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => fetchInventory(false)}
          >
            <Text style={styles.editBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cars}
          keyExtractor={(item) => item._id}
          renderItem={renderCarItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchInventory(true)}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.statusText}>No vehicles in inventory yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgMain, padding: 16 },
  centered: {
    flex: 1,
    backgroundColor: colors.bgMain,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  heading: { color: colors.textPrimary, fontSize: 22, fontWeight: "700" },
  count: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  listContent: { paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: colors.bgSurface,
    borderColor: colors.border,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    borderRadius: 8,
    padding: 14,
  },
  year: { color: colors.accent, fontWeight: "700", fontSize: 13 },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },
  price: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  actions: { flexDirection: "row", gap: 10, marginTop: 12 },
  primaryBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  editBtn: {
    backgroundColor: "#2b303c",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  editBtnText: { color: colors.textPrimary, fontWeight: "600" },
  deleteBtn: {
    backgroundColor: colors.accentDark,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  deleteBtnText: { color: colors.dangerText, fontWeight: "600" },
  errorBox: {
    backgroundColor: colors.bgSurface,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    gap: 10,
  },
  errorText: { color: colors.dangerText, fontWeight: "600" },
  emptyBox: {
    backgroundColor: colors.bgSurface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  statusText: { color: colors.textMuted, fontSize: 14 },
});