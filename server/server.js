const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const carRoutes = require("./routes/cars");

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

// 1. CORS configuration
const allowedOrigins = [
    "http://localhost:3000",   // React dev server
    "http://localhost:5000",   // Backend server
    "http://localhost:5173",   // Vite dev server
    "http://localhost:19006",  // Expo dev server
    "https://car-garage-app-jgbz-do1rc0lem-xdravynx.vercel.app", // Production client URL
    process.env.CLIENT_URL     // Additional client URL from env
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin) || !isProduction) {
            return callback(null, true);
        }

        const corsError = new Error("Not allowed by CORS");
        corsError.statusCode = 403;
        return callback(corsError);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// 2. Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// 3. MongoDB connection
const mongoURI = process.env.MONGO_URI || (!isProduction ? "mongodb://localhost:27017/car-garage" : null);

if (!mongoURI) {
    console.error("MONGO_URI is required when NODE_ENV=production.");
    process.exit(1);
}

mongoose.set("strictQuery", true);

mongoose.connect(mongoURI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

// 4. Routes & health check
app.use("/api/cars", carRoutes);

app.get("/health", (req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;
    res.status(dbConnected ? 200 : 503).json({
        status: dbConnected ? "OK" : "DEGRADED",
        dbState: mongoose.connection.readyState,
        timestamp: new Date().toISOString(),
    });
});

// 5. 404 handler (must come after all routes)
app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
});

// 6. Global error handler (must have 4 arguments)
app.use((err, req, res, next) => {
    console.error(err.stack || err);
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        error: isProduction && statusCode === 500 ? "Internal Server Error" : (err.message || "Internal Server Error"),
        ...(isProduction ? {} : { stack: err.stack }),
    });
});

// 7. Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});