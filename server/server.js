const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const carRoutes = require("./routes/cars");

const app = express();
const PORT = process.env.PORT || 5000;

// Normalize and build allowed origins
const extraOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = new Set(
  [
    "http://localhost:3000",
    "http://localhost:5000",
    "http://localhost:5173",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:19006",
    "http://127.0.0.1:19006",
    process.env.CLIENT_URL,
    ...extraOrigins,
  ]
    .filter(Boolean)
    .map((o) => o.trim().replace(/\/+$/, ""))
);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g., mobile apps, curl, health checks)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim().replace(/\/+$/, "");
      if (allowedOrigins.has(normalizedOrigin)) {
        return callback(null, true);
      }

      // Reject cleanly without throwing a 500 stack trace
      console.warn(`Blocked CORS origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB (require MONGO_URI in production)
const mongoURI =
  process.env.MONGO_URI ||
  (process.env.NODE_ENV !== "production"
    ? "mongodb://localhost:27017/car-garage"
    : "");

if (!mongoURI) {
  console.error(
    "MONGO_URI environment variable is required in production."
  );
  process.exit(1);
}

mongoose.set("strictQuery", true);

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

// API routes
app.use("/api/cars", carRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

// Handle 404 - Not Found
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});