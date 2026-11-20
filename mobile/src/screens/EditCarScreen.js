import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { getCarById, updateCar } from "../services/carApi";
import { colors } from "../theme/colors";

export default function EditCarScreen({ route, navigation }) {
  const { carId } = route.params;
  const currentYear = new Date().getFullYear();

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadVehicle() {
      try {
        const car = await getCarById(carId);
        if (active) {
          setMake(car.make || "");
          setModel(car.model || "");
          setYear(car.year != null ? String(car.year) : "");
          setPrice(car.price != null ? String(car.price) : "");
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadVehicle();
    return () => {
      active = false;
    };
  }, [carId]);

  async function handleUpdate() {
    setError(null);
    if (!make.trim() || !model.trim() || !year.trim()) {
      setError("Make, model, and year are required.");
      return;
    }

    const parsedYear = Number(year);
    if (Number.isNaN(parsedYear) || parsedYear < 1886 || parsedYear > currentYear + 1) {
      setError(`Enter a valid year between 1886 and ${currentYear + 1}.`);
      return;
    }

    const payload = {
      make: make.trim(),
      model: model.trim(),
      year: parsedYear,
    };

    if (price.trim() !== "") {
      const parsedPrice = Number(price);
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        setError("Price must be a non-negative number.");
        return;
      }
      payload.price = parsedPrice;
    }

    setSubmitting(true);
    try {
      await updateCar(carId, payload);
      navigation.goBack();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.hint}>Loading vehicle...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Edit Vehicle</Text>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Text style={styles.label}>Make</Text>
      <TextInput
        style={styles.input}
        value={make}
        onChangeText={setMake}
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Model</Text>
      <TextInput
        style={styles.input}
        value={model}
        onChangeText={setModel}
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Year</Text>
      <TextInput
        style={styles.input}
        value={year}
        onChangeText={setYear}
        keyboardType="number-pad"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Price ($)</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        placeholder="e.g. 28500"
        placeholderTextColor={colors.textMuted}
      />

      <TouchableOpacity
        style={[styles.submitBtn, submitting && styles.disabledBtn]}
        onPress={handleUpdate}
        disabled={submitting}
      >
        <Text style={styles.submitBtnText}>
          {submitting ? "Updating..." : "Update Vehicle"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgMain },
  content: { padding: 16, paddingBottom: 36 },
  centered: {
    flex: 1,
    backgroundColor: colors.bgMain,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  heading: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.bgInput,
    color: colors.textPrimary,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  hint: { color: colors.textMuted, fontSize: 13 },
  submitBtn: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 22,
  },
  disabledBtn: { opacity: 0.6 },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  errorBox: {
    backgroundColor: colors.bgSurface,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  errorText: { color: colors.dangerText, fontWeight: "600" },
});