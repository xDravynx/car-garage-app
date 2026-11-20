const rawBase = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5001";
const cleanBase = rawBase.trim().replace(/\/+$/, "").replace(/\/api$/, "");
const CARS_ENDPOINT = `${cleanBase}/api/cars`;

async function parseError(res, fallbackMessage) {
  try {
    const data = await res.json();
    return data.message || data.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function getCars() {
  const res = await fetch(CARS_ENDPOINT);
  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to fetch cars"));
  }
  return res.json();
}

export async function getCarById(id) {
  const res = await fetch(`${CARS_ENDPOINT}/${id}`);
  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to fetch vehicle details"));
  }
  return res.json();
}

export async function createCar(carData) {
  const res = await fetch(CARS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(carData),
  });
  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to create vehicle"));
  }
  return res.json();
}

export async function updateCar(id, carData) {
  const res = await fetch(`${CARS_ENDPOINT}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(carData),
  });
  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to update vehicle"));
  }
  return res.json();
}

export async function deleteCar(id) {
  const res = await fetch(`${CARS_ENDPOINT}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to delete vehicle"));
  }
  return res.json();
}