const NHTSA_BASE_URL = "https://vpic.nhtsa.dot.gov/api/vehicles";

export const POPULAR_MAKES = [
  "Acura", "Audi", "BMW", "Cadillac", "Chevrolet", "Chrysler",
  "Dodge", "Ford", "GMC", "Honda", "Hyundai", "Jeep",
  "Kia", "Lexus", "Mazda", "Mercedes-Benz", "Nissan", "Porsche",
  "Ram", "Subaru", "Tesla", "Toyota", "Volkswagen",
];

export async function getModelsByMakeAndYear(make, year) {
  if (!make) return [];

  const encodedMake = encodeURIComponent(make.trim());
  const endpoint = year
    ? `${NHTSA_BASE_URL}/GetModelsForMakeYear/make/${encodedMake}/model/year/${year}?format=json`
    : `${NHTSA_BASE_URL}/GetModelsForMake/${encodedMake}?format=json`;

  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error("Unable to fetch NHTSA catalog models");
  }

  const data = await res.json();
  const names = (data.Results || []).map((item) => item.Model_Name).filter(Boolean);
  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}