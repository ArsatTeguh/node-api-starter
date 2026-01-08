import { Request, Response, NextFunction } from 'express';
import { productService } from './services';
import { categoryService } from '../category/services';
import {
    createProductSchema,
    updateProductSchema,
    productIdParamSchema,
    productQuerySchema,
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
// Product Controller
// ==========================================
export const productController = {
    /**
     * GET /products
     * Get all products with pagination, filtering, and sorting
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const queryResult = productQuerySchema.safeParse(req.query);
            if (!queryResult.success) {
                sendBadRequest(res, 'Invalid query parameters', queryResult.error.message);
                return;
            }

            const { products, meta } = await productService.findAll(queryResult.data);
            sendSuccess(res, products, 'Products retrieved successfully', 200, meta);
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /products/:id
     * Get a product by ID
     */
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const paramResult = productIdParamSchema.safeParse(req.params);
            if (!paramResult.success) {
                sendBadRequest(res, 'Invalid product ID', paramResult.error.message);
                return;
            }

            const product = await productService.findById(paramResult.data.id);
            if (!product) {
                sendNotFound(res, 'Product not found');
                return;
            }

            sendSuccess(res, product, 'Product retrieved successfully');
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /products
     * Create a new product
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const bodyResult = createProductSchema.safeParse(req.body);
            if (!bodyResult.success) {
                sendBadRequest(res, 'Validation failed', bodyResult.error.message);
                return;
            }

            // Check if category exists
            const category = await categoryService.findById(bodyResult.data.categoryId);
            if (!category) {
                sendBadRequest(res, 'Category not found');
                return;
            }

            // Check if product with same SKU already exists
            const existingSku = await productService.findBySku(bodyResult.data.sku);
            if (existingSku) {
                sendConflict(res, 'Product with this SKU already exists');
                return;
            }

            const product = await productService.create(bodyResult.data);
            sendCreated(res, product, 'Product created successfully');
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /products/:id
     * Update a product by ID
     */
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const paramResult = productIdParamSchema.safeParse(req.params);
            if (!paramResult.success) {
                sendBadRequest(res, 'Invalid product ID', paramResult.error.message);
                return;
            }

            const bodyResult = updateProductSchema.safeParse(req.body);
            if (!bodyResult.success) {
                sendBadRequest(res, 'Validation failed', bodyResult.error.message);
                return;
            }

            // Check if product exists
            const existing = await productService.findById(paramResult.data.id);
            if (!existing) {
                sendNotFound(res, 'Product not found');
                return;
            }

            // If updating categoryId, check if category exists
            if (bodyResult.data.categoryId) {
                const category = await categoryService.findById(bodyResult.data.categoryId);
                if (!category) {
                    sendBadRequest(res, 'Category not found');
                    return;
                }
            }

            // If updating SKU, check for duplicates
            if (bodyResult.data.sku && bodyResult.data.sku !== existing.sku) {
                const duplicate = await productService.findBySku(bodyResult.data.sku);
                if (duplicate) {
                    sendConflict(res, 'Product with this SKU already exists');
                    return;
                }
            }

            const product = await productService.update(paramResult.data.id, bodyResult.data);
            sendSuccess(res, product, 'Product updated successfully');
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /products/:id
     * Delete a product by ID
     */
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const paramResult = productIdParamSchema.safeParse(req.params);
            if (!paramResult.success) {
                sendBadRequest(res, 'Invalid product ID', paramResult.error.message);
                return;
            }

            // Check if product exists
            const existing = await productService.findById(paramResult.data.id);
            if (!existing) {
                sendNotFound(res, 'Product not found');
                return;
            }

            await productService.delete(paramResult.data.id);
            sendNoContent(res);
        } catch (error) {
            next(error);
        }
    },

    /**
     * PATCH /products/:id/toggle-active
     * Toggle product active status
     */
    async toggleActive(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const paramResult = productIdParamSchema.safeParse(req.params);
            if (!paramResult.success) {
                sendBadRequest(res, 'Invalid product ID', paramResult.error.message);
                return;
            }

            const product = await productService.toggleActive(paramResult.data.id);
            if (!product) {
                sendNotFound(res, 'Product not found');
                return;
            }

            sendSuccess(res, product, `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            next(error);
        }
    },
};

export default productController;
