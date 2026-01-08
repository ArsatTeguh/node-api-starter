import { Prisma } from '../../prisma/generate/client';
import prisma from '../../config/database';
import {
    CreateProductInput,
    UpdateProductInput,
    ProductQuery,
} from './types';

// ==========================================
// Product Service
// ==========================================
export const productService = {
    /**
     * Get all products with pagination, filtering, and sorting
     */
    async findAll(query: ProductQuery) {
        const {
            page,
            limit,
            search,
            categoryId,
            isActive,
            minPrice,
            maxPrice,
            sortBy,
            sortOrder,
        } = query;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.ProductWhereInput = {
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { description: { contains: search, mode: 'insensitive' as const } },
                    { sku: { contains: search, mode: 'insensitive' as const } },
                ],
            }),
            ...(categoryId && { categoryId }),
            ...(isActive !== undefined && { isActive }),
            ...(minPrice !== undefined || maxPrice !== undefined
                ? {
                    price: {
                        ...(minPrice !== undefined && { gte: minPrice }),
                        ...(maxPrice !== undefined && { lte: maxPrice }),
                    },
                }
                : {}),
        };

        // Build order by clause
        const orderBy: Prisma.ProductOrderByWithRelationInput = {
            [sortBy]: sortOrder,
        };

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
            prisma.product.count({ where }),
        ]);

        return {
            products,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    /**
     * Find a product by ID
     */
    async findById(id: string) {
        return prisma.product.findUnique({
            where: { id },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    },

    /**
     * Find a product by SKU
     */
    async findBySku(sku: string) {
        return prisma.product.findUnique({
            where: { sku },
        });
    },

    /**
     * Create a new product
     */
    async create(data: CreateProductInput) {
        return prisma.product.create({
            data: {
                name: data.name,
                description: data.description ?? null,
                price: data.price,
                stock: data.stock,
                sku: data.sku,
                isActive: data.isActive,
                categoryId: data.categoryId,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    },

    /**
     * Update a product by ID
     */
    async update(id: string, data: UpdateProductInput) {
        return prisma.product.update({
            where: { id },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.price !== undefined && { price: data.price }),
                ...(data.stock !== undefined && { stock: data.stock }),
                ...(data.sku !== undefined && { sku: data.sku }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
                ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    },

    /**
     * Delete a product by ID
     */
    async delete(id: string) {
        return prisma.product.delete({
            where: { id },
        });
    },

    /**
     * Update product stock
     */
    async updateStock(id: string, quantity: number) {
        return prisma.product.update({
            where: { id },
            data: {
                stock: {
                    increment: quantity,
                },
            },
        });
    },

    /**
     * Toggle product active status
     */
    async toggleActive(id: string) {
        const product = await prisma.product.findUnique({
            where: { id },
            select: { isActive: true },
        });

        if (!product) return null;

        return prisma.product.update({
            where: { id },
            data: {
                isActive: !product.isActive,
            },
        });
    },
};

export default productService;
