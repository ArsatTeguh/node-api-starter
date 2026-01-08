import { Response } from 'express';

// ==========================================
// API Response Types
// ==========================================
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

// ==========================================
// Success Response Helpers
// ==========================================
export const sendSuccess = <T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    meta?: ApiResponse['meta']
): Response => {
    const response: ApiResponse<T> = {
        success: true,
        message,
        data,
        ...(meta && { meta }),
    };
    return res.status(statusCode).json(response);
};

export const sendCreated = <T>(
    res: Response,
    data: T,
    message = 'Created successfully'
): Response => {
    return sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res: Response): Response => {
    return res.status(204).send();
};

// ==========================================
// Error Response Helpers
// ==========================================
export const sendError = (
    res: Response,
    message: string,
    statusCode = 500,
    error?: string
): Response => {
    const response: ApiResponse = {
        success: false,
        message,
        ...(error && { error }),
    };
    return res.status(statusCode).json(response);
};

export const sendBadRequest = (res: Response, message = 'Bad Request', error?: string): Response => {
    return sendError(res, message, 400, error);
};

export const sendNotFound = (res: Response, message = 'Resource not found'): Response => {
    return sendError(res, message, 404);
};

export const sendConflict = (res: Response, message = 'Resource already exists'): Response => {
    return sendError(res, message, 409);
};

export const sendInternalError = (res: Response, error?: string): Response => {
    return sendError(res, 'Internal server error', 500, error);
};
