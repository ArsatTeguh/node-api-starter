import { z } from 'zod';

// ==========================================
// Product Validation Schemas
// ==========================================

// Base schema for product data
export const productBaseSchema = z.object({
    name: z
        .string()
        .min(1, 'Product name is required')
        .max(200, 'Product name must be at most 200 characters')
        .trim(),
    description: z
        .string()
        .max(1000, 'Description must be at most 1000 characters')
        .trim()
        .optional()
        .nullable(),
    price: z
        .union([z.string(), z.number()])
        .transform((val) => {
            const num = typeof val === 'string' ? parseFloat(val) : val;
            if (isNaN(num)) throw new Error('Invalid price format');
            return num;
        })
        .pipe(z.number().positive('Price must be a positive number').max(99999999.99, 'Price is too large')),
    stock: z
        .number()
        .int('Stock must be an integer')
        .min(0, 'Stock cannot be negative')
        .default(0),
    sku: z
        .string()
        .min(1, 'SKU is required')
        .max(50, 'SKU must be at most 50 characters')
        .trim(),
    isActive: z.boolean().default(true),
    categoryId: z.string().uuid('Invalid category ID format'),
});

// Schema for creating a product
export const createProductSchema = productBaseSchema;

// Schema for updating a product (all fields optional)
export const updateProductSchema = productBaseSchema.partial();

// Schema for product ID parameter
export const productIdParamSchema = z.object({
    id: z.string().uuid('Invalid product ID format'),
});

// Schema for query parameters (pagination and filters)
export const productQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    isActive: z
        .string()
        .transform((val) => val === 'true')
        .optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    sortBy: z.enum(['name', 'price', 'createdAt', 'stock']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ==========================================
// TypeScript Types (inferred from schemas)
// ==========================================
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductIdParam = z.infer<typeof productIdParamSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;

// Response type for product (from Prisma)
export interface ProductResponse {
    id: string;
    name: string;
    description: string | null;
    price: string;
    stock: number;
    sku: string;
    isActive: boolean;
    categoryId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductWithCategory extends ProductResponse {
    category?: {
        id: string;
        name: string;
    };
}
