import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { sendBadRequest, sendInternalError, sendNotFound } from './utils/response';

// ==========================================
// Error Handler Middleware
// ==========================================
export const errorHandler: ErrorRequestHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error('Error:', err);

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        sendBadRequest(res, 'Validation error', err.message);
        return;
    }

    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err as { code?: string; meta?: { target?: string[] } };

        switch (prismaError.code) {
            case 'P2002':
                // Unique constraint violation
                const field = prismaError.meta?.target?.[0] || 'field';
                sendBadRequest(res, `A record with this ${field} already exists`);
                return;
            case 'P2025':
                // Record not found
                sendNotFound(res, 'Record not found');
                return;
            case 'P2003':
                // Foreign key constraint
                sendBadRequest(res, 'Referenced record does not exist');
                return;
            default:
                sendInternalError(res, 'Database error occurred');
                return;
        }
    }

    // Handle other Prisma errors
    if (err.name === 'PrismaClientValidationError') {
        sendBadRequest(res, 'Invalid data provided');
        return;
    }

    // Default error response
    const errorMessage = process.env.NODE_ENV === 'development' ? err.message : undefined;
    sendInternalError(res, errorMessage);
};

// ==========================================
// Not Found Handler
// ==========================================
export const notFoundHandler = (_req: Request, res: Response): void => {
    sendNotFound(res, 'Endpoint not found');
};

// ==========================================
// Request Logger Middleware
// ==========================================
export const requestLogger = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
};

// ==========================================
// Async Handler Wrapper
// ==========================================
export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
