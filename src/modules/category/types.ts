import { z } from 'zod';

// ==========================================
// Category Validation Schemas
// ==========================================

// Base schema for category data
export const categoryBaseSchema = z.object({
    name: z
        .string()
        .min(1, 'Category name is required')
        .max(100, 'Category name must be at most 100 characters')
        .trim(),
    description: z
        .string()
        .max(500, 'Description must be at most 500 characters')
        .trim()
        .optional()
        .nullable(),
});

// Schema for creating a category
export const createCategorySchema = categoryBaseSchema;

// Schema for updating a category (all fields optional)
export const updateCategorySchema = categoryBaseSchema.partial();

// Schema for category ID parameter
export const categoryIdParamSchema = z.object({
    id: z.string().uuid('Invalid category ID format'),
});

// Schema for query parameters (pagination)
export const categoryQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
});

// ==========================================
// TypeScript Types (inferred from schemas)
// ==========================================
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>;
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;

// Response type for category (from Prisma)
export interface CategoryResponse {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CategoryWithProductCount extends CategoryResponse {
    _count?: {
        products: number;
    };
}
