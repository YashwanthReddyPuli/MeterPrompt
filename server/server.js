const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const planRoutes = require('./routes/planRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const gatewayRoutes = require('./routes/gatewayRoutes');

// Initialize Express App
const app = express();

// Connect to MongoDB Database
connectDB();

// Global Middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const billingRoutes = require('./routes/billingRoutes');

// Health Check Endpoint (accessible at /health and /api/health)
const healthHandler = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MeterPrompt AI API Gateway & Billing Platform Server is healthy.',
    timestamp: new Date().toISOString(),
    proxyMode: process.env.AI_PROXY_MODE || 'mock'
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/keys', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/v1', gatewayRoutes);

// 404 Route Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' not found on this server.`,
    errorCode: 'NOT_FOUND_ERROR'
  });
});

// Centralized Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[MeterPrompt Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = { app, server };
