const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
    make: {
        type: String,
        required: [true, "Make is required"],
        trim: true,
    },
    model: {
        type: String,
        required: [true, "Model is required"],
        trim: true,
    },
    year: {
        type: Number,
        required: [true, "Year is required"],
        min: [1886, "Year must be 1886 or later"],
        max: [new Date().getFullYear() + 1, "Year is too far in the future"],
    },
    price: {
        type: Number,
        min: [0, "Price cannot be negative"],
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Car", carSchema);