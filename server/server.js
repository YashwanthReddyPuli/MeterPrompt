const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { AppError } = require('./utils/AppError');

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
const couponRoutes = require('./routes/couponRoutes');
const adminBillingRoutes = require('./routes/adminBillingRoutes');
const adminReportRoutes = require('./routes/adminReportRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const adminEventRoutes = require('./routes/adminEventRoutes');

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

// API Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/keys', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/invoices', billingRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/billing', adminBillingRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', couponRoutes);
app.use('/api/admin', adminReportRoutes);
app.use('/api/admin', adminBillingRoutes);
app.use('/api/admin', adminUserRoutes);
app.use('/api/admin', adminEventRoutes);

// AI Proxy Gateway Endpoints (/api/v1/chat/completions and /api/proxy/v1/chat/completions)
app.use('/api/v1', gatewayRoutes);
app.use('/api/proxy/v1', gatewayRoutes);
app.use('/api/proxy', gatewayRoutes);





// Catch-All 404 Route Handler for API endpoints
app.all('/api/*', (req, res, next) => {
  next(new AppError(`The requested endpoint '${req.originalUrl}' does not exist on this gateway.`, 404, 'ENDPOINT_NOT_FOUND'));
});

// Centralized Error Handler Middleware (must have 4 arguments)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
let server;
if (require.main === module) {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MeterPrompt Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = { app, server };
