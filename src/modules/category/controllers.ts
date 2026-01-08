import { Request, Response, NextFunction } from 'express';
import { categoryService } from './services';
import {
    createCategorySchema,
    updateCategorySchema,
    categoryIdParamSchema,
    categoryQuerySchema,
} from './types';
import {
    sendSuccess,
    sendCreated,
    sendNoContent,
    sendBadRequest,
    sendNotFound,
    sendConflict,
} from '../../utils/response';

// ==========================================
// Category Controller
// ==========================================
export const categoryController = {
    /**
     * GET /categories
     * Get all categories with pagination
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const queryResult = categoryQuerySchema.safeParse(req.query);
            if (!queryResult.success) {
                sendBadRequest(res, 'Invalid query parameters', queryResult.error.message);
                return;
            }

            const { categories, meta } = await categoryService.findAll(queryResult.data);
            sendSuccess(res, categories, 'Categories retrieved successfully', 200, meta);
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /categories/:id
     * Get a category by ID
     */
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const paramResult = categoryIdParamSchema.safeParse(req.params);
            if (!paramResult.success) {
                sendBadRequest(res, 'Invalid category ID', paramResult.error.message);
                return;
            }

            const category = await categoryService.findById(paramResult.data.id);
            if (!category) {
                sendNotFound(res, 'Category not found');
                return;
            }

            sendSuccess(res, category, 'Category retrieved successfully');
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /categories
     * Create a new category
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const bodyResult = createCategorySchema.safeParse(req.body);
            if (!bodyResult.success) {
                sendBadRequest(res, 'Validation failed', bodyResult.error.message);
                return;
            }

            // Check if category with same name already exists
            const existing = await categoryService.findByName(bodyResult.data.name);
            if (existing) {
                sendConflict(res, 'Category with this name already exists');
                return;
            }

            const category = await categoryService.create(bodyResult.data);
            sendCreated(res, category, 'Category created successfully');
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /categories/:id
     * Update a category by ID
     */
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const paramResult = categoryIdParamSchema.safeParse(req.params);
            if (!paramResult.success) {
                sendBadRequest(res, 'Invalid category ID', paramResult.error.message);
                return;
            }

            const bodyResult = updateCategorySchema.safeParse(req.body);
            if (!bodyResult.success) {
                sendBadRequest(res, 'Validation failed', bodyResult.error.message);
                return;
            }

            // Check if category exists
            const existing = await categoryService.findById(paramResult.data.id);
            if (!existing) {
                sendNotFound(res, 'Category not found');
                return;
            }

            // If updating name, check for duplicates
            if (bodyResult.data.name && bodyResult.data.name !== existing.name) {
                const duplicate = await categoryService.findByName(bodyResult.data.name);
                if (duplicate) {
                    sendConflict(res, 'Category with this name already exists');
                    return;
                }
            }

            const category = await categoryService.update(paramResult.data.id, bodyResult.data);
            sendSuccess(res, category, 'Category updated successfully');
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /categories/:id
     * Delete a category by ID
     */
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const paramResult = categoryIdParamSchema.safeParse(req.params);
            if (!paramResult.success) {
                sendBadRequest(res, 'Invalid category ID', paramResult.error.message);
                return;
            }

            // Check if category exists
            const existing = await categoryService.findById(paramResult.data.id);
            if (!existing) {
                sendNotFound(res, 'Category not found');
                return;
            }

            // Check if category has products (prevent deletion if has products)
            const hasProducts = await categoryService.hasProducts(paramResult.data.id);
            if (hasProducts) {
                sendConflict(res, 'Cannot delete category with associated products');
                return;
            }

            await categoryService.delete(paramResult.data.id);
            sendNoContent(res);
        } catch (error) {
            next(error);
        }
    },
};

export default categoryController;
