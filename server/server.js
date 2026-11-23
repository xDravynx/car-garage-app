const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const carRoutes = require("./routes/cars");

const app = express();
const PORT = process.env.PORT || 10000;
const isProduction = process.env.NODE_ENV === "production";

// 1. CORS configuration
const allowedOrigins = [
    "http://localhost:3000",   // React dev server
    "http://localhost:5000",   // Backend server
    "http://localhost:5173",   // Vite dev server
    "http://localhost:19006",  // Expo dev server
    "https://car-garage-app-im92.onrender.com", // Production URL
    process.env.CLIENT_URL,    // Production / configured client URL
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser requests (curl, Postman, server-to-server)
        if (!origin) {
            return callback(null, true);
        }

        if (!isProduction || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        const corsError = new Error(`Origin not allowed by CORS: ${origin}`);
        corsError.statusCode = 403;
        return callback(corsError);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// 2. Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 3. Routes & health check
app.use("/api/cars", carRoutes);

app.get("/health", (req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;
    res.status(dbConnected ? 200 : 503).json({
        status: dbConnected ? "OK" : "DEGRADED",
        dbState: mongoose.connection.readyState,
        timestamp: new Date().toISOString(),
    });
});

// 4. 404 handler (must come after all routes)
app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
});

// 5. Global error handler (must have 4 arguments)
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || err.status || 500;
    if (statusCode >= 500 || !isProduction) {
        console.error(err.stack || err);
    }

    res.status(statusCode).json({
        error:
            isProduction && statusCode >= 500
                ? "Internal Server Error"
                : err.message || "Internal Server Error",
        ...(isProduction ? {} : { stack: err.stack }),
    });
});

// 6. Connect to MongoDB, then start server
const mongoURI =
    process.env.MONGO_URI ||
    (!isProduction ? "mongodb://localhost:27017/car-garage" : null);

if (!mongoURI) {
    console.error("MONGO_URI is required when NODE_ENV=production.");
    process.exit(1);
}

mongoose.set("strictQuery", true);

mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
});

let server;

async function startServer() {
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB");

        server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} (${process.env.NODE_ENV || "development"})`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

async function shutdown(signal) {
    console.log(`${signal} received. Shutting down gracefully...`);
    try {
        if (server) {
            await new Promise((resolve, reject) => {
                server.close((err) => (err ? reject(err) : resolve()));
            });
        }
        await mongoose.connection.close(false);
        process.exit(0);
    } catch (err) {
        console.error("Error during shutdown:", err);
        process.exit(1);
    }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer();