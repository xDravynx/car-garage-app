const mongoose = require("mongoose");
require("dotenv").config();
const Car = require("./models/Car");

const starterCars = [
    { make: "Jeep", model: "Cherokee", year: 2017, price: 14500 },
    { make: "Porsche", model: "911 GT3 RS", year: 2026, price: 241300 },
    { make: "Toyota", model: "GR Corolla", year: 2024, price: 36500 },
    { make: "Ford", model: "Mustang Mach 1", year: 2023, price: 56570 },
];

async function getNhtsaSampleCars() {
    const res = await fetch(
        "https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/jeep/modelyear/2017?format=json"
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.Results || []).slice(0, 2).map((item, idx) => ({
        make: item.Make_Name,
        model: item.Model_Name,
        year: 2017,
        price: 15000 + idx * 1200,
    }));
}

async function runSeed() {
    if (!process.env.MONGO_URI) {
        console.error("Missing MONGO_URI in .env");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    const nhtsaCars = await getNhtsaSampleCars();
    const allCars = [...starterCars, ...nhtsaCars];

    await Car.deleteMany({});
    const inserted = await Car.insertMany(allCars);
    console.log(`Seeded ${inserted.length} cars into MongoDB.`);

    await mongoose.disconnect();
}

runSeed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});