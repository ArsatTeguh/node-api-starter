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
    console.log('🔍 Query received:', JSON.stringify(query, null, 2));
    
    const {
        page = 1,
        limit = 10,
        search,
        categoryId,
        isActive,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        sortOrder = 'desc',
    } = query;
    
    console.log('📊 Parsed params:', { page, limit, sortBy, sortOrder });
    
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
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

    console.log('🎯 Where clause:', JSON.stringify(where, null, 2));

    const orderBy: Prisma.ProductOrderByWithRelationInput = {
        [sortBy]: sortOrder,
    };
    
    console.log('📈 Order by:', JSON.stringify(orderBy, null, 2));

    try {
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

        console.log('✅ Query successful. Found:', total, 'products');

        return {
            products,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error('❌ Error in findAll:', error);
        throw error;
    }
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
