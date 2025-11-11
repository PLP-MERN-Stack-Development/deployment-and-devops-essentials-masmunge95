// server.js - Main server file for the MERN blog application

// Import required modules
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
const logger = require('./src/middleware/logger');
const performanceMonitor = require('./src/middleware/performanceMonitor');
const errorHandler = require('./src/middleware/errorHandler');
const { ClerkExpressRequireAuth, ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
const Sentry = require('@sentry/node');

// Sentry Initialization - Must be the first thing in your file
Sentry.init({
  dsn: process.env.SENTRY_DSN_SERVER, // Use the DSN from your environment variables
  // The Http and Express integrations are now enabled by default in Sentry v8+
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
  profilesSampleRate: 1.0, // Capture 100% of profiles for performance monitoring
});


// Load environment variables
dotenv.config();

// Import routes
const postRoutes = require('./src/routes/postRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const webhookRoutes = require('./src/routes/webhookRoutes');

function setupApp(authMiddleware) {
  const appInstance = express();

  // Handle webhook routes before any other middleware, especially CORS.
  // Webhooks use signing secrets for security and don't need CORS.
  appInstance.use('/api/webhooks', webhookRoutes);

  // CORS configuration. Reads origins from the .env file.
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim());
  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Block all other origins
      return callback(new Error(`Origin '${origin}' not allowed by CORS`));
    },
    credentials: true,
  };
  appInstance.use(cors(corsOptions));

  // Other middleware
  appInstance.use(express.json({ limit: '10mb' }));
  appInstance.use(express.urlencoded({ extended: true, limit: '10mb' }));
  appInstance.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Add logging and performance middleware
  appInstance.use(logger);
  appInstance.use(performanceMonitor);

  // Define routers for public and private (authenticated) API routes
  const publicApiRouter = express.Router();
  const privateApiRouter = express.Router();

  // Apply authentication middleware to the private router if provided
  if (authMiddleware) {
    privateApiRouter.use(authMiddleware);
  }

  // Assign routes to the appropriate router
  publicApiRouter.use('/posts', postRoutes.public); // Public post routes (GET all, GET one)
  privateApiRouter.use('/posts', postRoutes.private); // Private post routes (CRUD)
  publicApiRouter.use('/categories', categoryRoutes.public); // Public category routes (GET all)
  privateApiRouter.use('/categories', categoryRoutes.private); // Private category routes (CRUD)

  appInstance.use('/api', publicApiRouter);
  appInstance.use('/api', privateApiRouter);

  // Root route
  appInstance.get('/', (req, res) => {
    res.send('MERN Blog API is running');
  });


  // The Sentry error handler must be the last "error" middleware
  // This function should be called after all other middleware and routes
  Sentry.setupExpressErrorHandler(appInstance);
  // Error handling middleware
  appInstance.use(errorHandler);
  return appInstance;
}

const startServer = async () => {
  const PORT = process.env.PORT || 5000;
  await connectDB();
  const server = setupApp(ClerkExpressRequireAuth()).listen(PORT, () => {
    console.log(`🚀 API server running on http://localhost:${PORT}`);
    const origins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim());
    console.log('Allowed CORS origins:', origins);
  });
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    server.close(() => process.exit(1));
  });
};

if (require.main === module) {
  startServer();
}

module.exports = setupApp; 