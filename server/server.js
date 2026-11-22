const allowedOrigins = [
    'http://localhost:3000',        // Alternative port React development
    'http://localhost:5000',        // Backend server port
    'http://localhost:5173',        // Vite development server port
    'http://localhost:19006',       // Expo development server port
    process.env.CLIENT_URL          // Production client URL
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (curl, Postman, mobile apps, SSR/health checks)
        if (!origin) {
            return callback(null, true);
        }

        // Allow explicitly listed origins
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // In non-production, allow any origin (including LAN IPs / Expo / tunnel URLs)
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }

        // Optional: allow Vercel preview deployments if needed
        // if (origin.endsWith('.vercel.app')) return callback(null, true);

        const err = new Error(`Origin ${origin} not allowed by CORS`);
        err.status = 403;
        return callback(err, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
// Handle preflight requests cleanly across routes
app.options('*', cors(corsOptions));