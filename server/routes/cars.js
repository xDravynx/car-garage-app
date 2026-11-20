const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Car = require("../models/Car");

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

function parsePrice(value) {
    if (value === "" || value === null || value === undefined) {
        return undefined;
    }
    const num = Number(value);
    return Number.isNaN(num) ? undefined : num;
}

// GET all cars (newest first)
router.get("/", async (req, res) => {
    try {
        const cars = await Car.find().sort({ created_at: -1 });
        res.json(cars);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single car by ID
router.get("/:id", async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid vehicle ID" });
    }
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: "Car not found" });
        }
        res.json(car);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create a new car
router.post("/", async (req, res) => {
    try {
        const car = new Car({
            make: req.body.make,
            model: req.body.model,
            year: Number(req.body.year),
            price: parsePrice(req.body.price),
        });
        const savedCar = await car.save();
        res.status(201).json(savedCar);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update an existing car
router.put("/:id", async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid vehicle ID" });
    }
    try {
        const updatedCar = await Car.findByIdAndUpdate(
            req.params.id,
            {
                make: req.body.make,
                model: req.body.model,
                year: Number(req.body.year),
                price: parsePrice(req.body.price),
            },
            { new: true, runValidators: true }
        );
        if (!updatedCar) {
            return res.status(404).json({ message: "Car not found" });
        }
        res.json(updatedCar);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a car
router.delete("/:id", async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid vehicle ID" });
    }
    try {
        const deletedCar = await Car.findByIdAndDelete(req.params.id);
        if (!deletedCar) {
            return res.status(404).json({ message: "Car not found" });
        }
        res.json({ message: "Car deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;