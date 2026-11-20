const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
const cleanBase = rawBaseUrl.trim().replace(/\/+$/, "");
const API_BASE_URL = cleanBase.endsWith("/api") ? cleanBase : `${cleanBase}/api`;

async function parseError(res, fallbackMessage) {
    try {
        const data = await res.json();
        return data.message || data.error || fallbackMessage;
    } catch {
        return fallbackMessage;
    }
}
    
export async function getCars() {
    const res = await fetch(`${API_BASE_URL}/cars`);
    if (!res.ok) {
        throw new Error(await parseError(res, 'Failed to fetch cars'));
    }
    return res.json();
}

export async function getCarById(id) {
    const res = await fetch(`${API_BASE_URL}/cars/${id}`);
    if (!res.ok) {
        throw new Error(await parseError(res, `Failed to fetch car with id ${id}`));
    }
    return res.json();
}

export async function createCar(carData) {
    const res = await fetch(`${API_BASE_URL}/cars`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(carData),
    });
    if (!res.ok) {
        throw new Error(await parseError(res, 'Failed to create car'));
    }
    return res.json();
}

export async function updateCar(id, carData) {
    const res = await fetch(`${API_BASE_URL}/cars/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(carData),
    });
    if (!res.ok) {
        throw new Error(await parseError(res, `Failed to update car with id ${id}`));
    }
    return res.json();
}

export async function deleteCar(id) {
    const res = await fetch(`${API_BASE_URL}/cars/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) {
        throw new Error(await parseError(res, `Failed to delete car with id ${id}`));
    }
    return res.json();
}