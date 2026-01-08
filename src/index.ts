import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import middlewares
import { errorHandler, notFoundHandler, requestLogger } from './middlewares';

// Import routes
import categoryRoutes from './modules/category/routes';
import productRoutes from './modules/products/routes';

// ==========================================
// App Configuration
// ==========================================
const app: Application = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// Security Middlewares
// ==========================================
// Helmet for security headers
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
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
// Health Check Endpoint
// ==========================================
app.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
    });
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
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
