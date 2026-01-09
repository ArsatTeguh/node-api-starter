// ==========================================
// CRITICAL: Load environment variables FIRST!
// ==========================================
import 'dotenv/config';

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import middlewares
import { errorHandler, notFoundHandler, requestLogger } from './middlewares';

// Import routes (setelah dotenv loaded)
import categoryRoutes from './modules/category/routes';
import productRoutes from './modules/products/routes';

// // Import database untuk test connection
// import prisma from './config/database';

// ==========================================
// App Configuration
// ==========================================
const app: Application = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// Security Middlewares
// ==========================================
app.use(helmet());

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// ==========================================
// Body Parsing
// ==========================================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ==========================================
// Request Logging
// ==========================================
app.use(requestLogger);

// ==========================================
// Health Check Endpoint (with DB check)
// ==========================================
app.get('/health', async (_req, res) => {
    try {
        
        res.status(200).json({
            success: true,
            message: 'Server is healthy',
            database: 'connected',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            message: 'Server is unhealthy',
            database: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});

// ==========================================
// API Routes
// ==========================================
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);

// ==========================================
// Error Handling
// ==========================================
app.use(notFoundHandler);
app.use(errorHandler);

// ==========================================
// Server Start
// ==========================================
const startServer = async () => {
    try {
        
        app.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📚 API available at http://localhost:${PORT}${API_PREFIX}`);
            console.log(`💚 Health check at http://localhost:${PORT}/health`);
            console.log('='.repeat(50));
            console.log('\nAvailable endpoints:');
            console.log(`  Categories: ${API_PREFIX}/categories`);
            console.log(`  Products:   ${API_PREFIX}/products`);
            console.log('');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        console.error('\n💡 Troubleshooting tips:');
        console.error('  1. Check if DATABASE_URL is set in .env');
        console.error('  2. Run: npx prisma generate');
        console.error('  3. Run: npx prisma db push');
        console.error('  4. Run: npm run db:seed\n');
        process.exit(1);
    }
};


startServer();

export default app;