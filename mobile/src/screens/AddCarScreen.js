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
import { createCar } from "../services/carApi";
import { POPULAR_MAKES, getModelsByMakeAndYear } from "../services/catalogApi";
import { colors } from "../theme/colors";

export default function AddCarScreen({ navigation }) {
  const currentYear = new Date().getFullYear();

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(String(currentYear));
  const [price, setPrice] = useState("");
  const [catalogModels, setCatalogModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadModels() {
      if (!make.trim()) {
        setCatalogModels([]);
        return;
      }
      setLoadingModels(true);
      try {
        const list = await getModelsByMakeAndYear(make, year);
        if (active) {
          setCatalogModels(list);
        }
      } catch {
        if (active) {
          setCatalogModels([]);
        }
      } finally {
        if (active) {
          setLoadingModels(false);
        }
      }
    }
    loadModels();
    return () => {
      active = false;
    };
  }, [make, year]);

  async function handleSubmit() {
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
      await createCar(payload);
      navigation.goBack();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Register Vehicle</Text>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Text style={styles.label}>Year</Text>
      <TextInput
        style={styles.input}
        value={year}
        onChangeText={setYear}
        keyboardType="number-pad"
        placeholder="e.g. 2026"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Make</Text>
      <TextInput
        style={styles.input}
        value={make}
        onChangeText={setMake}
        placeholder="e.g. Jeep"
        placeholderTextColor={colors.textMuted}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
      >
        {POPULAR_MAKES.map((item) => {
          const selected = make.toLowerCase() === item.toLowerCase();
          return (
            <TouchableOpacity
              key={item}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => setMake(item)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.label}>Model</Text>
      <TextInput
        style={styles.input}
        value={model}
        onChangeText={setModel}
        placeholder="Enter or tap a catalog model"
        placeholderTextColor={colors.textMuted}
      />

      {loadingModels ? (
        <View style={styles.catalogLoader}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.hint}>Fetching NHTSA models...</Text>
        </View>
      ) : (
        catalogModels.length > 0 && (
          <View>
            <Text style={styles.hint}>Catalog suggestions (tap to fill):</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipRow}
            >
              {catalogModels.slice(0, 20).map((modelName) => {
                const selected = model === modelName;
                return (
                  <TouchableOpacity
                    key={modelName}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => setModel(modelName)}
                  >
                    <Text
                      style={[styles.chipText, selected && styles.chipTextSelected]}
                    >
                      {modelName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )
      )}

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
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitBtnText}>
          {submitting ? "Saving Vehicle..." : "Save Vehicle"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgMain },
  content: { padding: 16, paddingBottom: 36 },
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
  chipRow: { marginTop: 8, marginBottom: 4 },
  chip: {
    backgroundColor: colors.bgSurface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: { color: colors.textPrimary, fontSize: 13 },
  chipTextSelected: { color: "#fff", fontWeight: "700" },
  catalogLoader: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  hint: { color: colors.textMuted, fontSize: 12, marginTop: 8 },
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