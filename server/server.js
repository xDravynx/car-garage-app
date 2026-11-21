const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config();

const carRoutes = require("./routes/cars");

const app = express();
const PORT = process.env.PORT || 5000;

//first, cors configuration
const allowedOrigins = [
    'http://localhost:3000',        //Alternative port React development
    'http://localhost:5000',       //Backend server port
    'http://localhost:5173',       //Vite development server port
    'https://car-garage-app.onrender.com',
    process.env.CLIENT_URL         //Production client URL  
].filter(Boolean);                  // Filter out any undefined value

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)    
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else if (process.env.NODE_ENV !== 'production') {
            // Allow unknown origins in development for testing
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));
// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/car-garage';

if (!mongoURI) {
    console.error("MongoDB connection string is not defined in environment variables.");
    process.exit(1);
}

mongoose.set('strictQuery', true); // To suppress deprecation warning for strictQuery

mongoose.connect(mongoURI)
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
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.status || 500;
    res.status(statusCode).json({ 
        error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack });
});

// Handle 404 - Not Found
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});