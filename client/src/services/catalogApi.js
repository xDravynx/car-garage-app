const NHTSA_BASE_URL = "https://vpic.nhtsa.dot.gov/api/vehicles";

// Curated popular makes (or fetch full list from GetMakesForVehicleType/car)
export const POPULAR_MAKES = [
    "Acura", "Audi", "BMW", "Cadillac", "Chevrolet", "Chrysler",
    "Dodge", "Ford", "GMC", "Honda", "Hyundai", "Infiniti",
    "Jeep", "Kia", "Lexus", "Mazda", "Mercedes-Benz", "Nissan",
    "Porsche", "Ram", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo"
];

export async function getModelsByMakeAndYear(make, year) {
    if (!make) return [];

    const encodedMake = encodeURIComponent(make.trim());
    const endpoint = year
        ? `${NHTSA_BASE_URL}/GetModelsForMakeYear/make/${encodedMake}/modelyear/${year}?format=json`
        : `${NHTSA_BASE_URL}/GetModelsForMake/${encodedMake}?format=json`;

    const res = await fetch(endpoint);
    if (!res.ok) {
        throw new Error("Failed to load vehicle models from NHTSA catalog");
    }

    const data = await res.json();
    const results = data.Results || [];

    // Deduplicate and sort model names alphabetically
    const uniqueModels = [...new Set(results.map((item) => item.Model_Name))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));

    return uniqueModels;
}