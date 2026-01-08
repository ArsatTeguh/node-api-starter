import prisma from '../../config/database';
import {
    CreateCategoryInput,
    UpdateCategoryInput,
    CategoryQuery,
    CategoryWithProductCount,
} from './types';

// ==========================================
// Category Service
// ==========================================
export const categoryService = {
    /**
     * Get all categories with pagination
     */
    async findAll(query: CategoryQuery) {
        const { page, limit, search } = query;
        const skip = (page - 1) * limit;

        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { description: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        const [categories, total] = await Promise.all([
            prisma.category.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { products: true },
                    },
                },
            }),
            prisma.category.count({ where }),
        ]);

        return {
            categories: categories as CategoryWithProductCount[],
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    /**
     * Find a category by ID
     */
    async findById(id: string) {
        return prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });
    },

    /**
     * Find a category by name
     */
    async findByName(name: string) {
        return prisma.category.findUnique({
            where: { name },
        });
    },

    /**
     * Create a new category
     */
    async create(data: CreateCategoryInput) {
        return prisma.category.create({
            data: {
                name: data.name,
                description: data.description ?? null,
            },
        });
    },

    /**
     * Update a category by ID
     */
    async update(id: string, data: UpdateCategoryInput) {
        return prisma.category.update({
            where: { id },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
            },
        });
    },

    /**
     * Delete a category by ID
     */
    async delete(id: string) {
        return prisma.category.delete({
            where: { id },
        });
    },

    /**
     * Check if a category has products
     */
    async hasProducts(id: string): Promise<boolean> {
        const count = await prisma.product.count({
            where: { categoryId: id },
        });
        return count > 0;
    },
};

export default categoryService;
