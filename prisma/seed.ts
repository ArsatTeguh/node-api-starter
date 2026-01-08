import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/prisma/generate/client';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting database seed...\n');

    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    // Create categories
    console.log('Creating categories...');
    const categories = await Promise.all([
        prisma.category.create({
            data: {
                name: 'Electronics',
                description: 'Electronic devices and gadgets',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Clothing',
                description: 'Apparel and fashion items',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Home & Garden',
                description: 'Home decor and gardening supplies',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Books',
                description: 'Books and publications',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Sports & Outdoors',
                description: 'Sports equipment and outdoor gear',
            },
        }),
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    // Create products
    console.log('Creating products...');
    const products = await Promise.all([
        // Electronics
        prisma.product.create({
            data: {
                name: 'Wireless Bluetooth Headphones',
                description: 'Premium noise-canceling wireless headphones with 30-hour battery life',
                price: 149.99,
                stock: 50,
                sku: 'ELEC-WBH-001',
                isActive: true,
                categoryId: categories[0].id,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Smart Watch Pro',
                description: 'Advanced fitness tracking smartwatch with heart rate monitor',
                price: 299.99,
                stock: 30,
                sku: 'ELEC-SWP-002',
                isActive: true,
                categoryId: categories[0].id,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Portable Power Bank',
                description: '20000mAh fast-charging power bank with dual USB ports',
                price: 49.99,
                stock: 100,
                sku: 'ELEC-PPB-003',
                isActive: true,
                categoryId: categories[0].id,
            },
        }),

        // Clothing
        prisma.product.create({
            data: {
                name: 'Classic Cotton T-Shirt',
                description: '100% organic cotton t-shirt, comfortable everyday wear',
                price: 24.99,
                stock: 200,
                sku: 'CLTH-CCT-001',
                isActive: true,
                categoryId: categories[1].id,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Denim Jeans Regular Fit',
                description: 'Classic denim jeans with comfortable regular fit',
                price: 59.99,
                stock: 150,
                sku: 'CLTH-DJR-002',
                isActive: true,
                categoryId: categories[1].id,
            },
        }),

        // Home & Garden
        prisma.product.create({
            data: {
                name: 'Indoor Plant Pot Set',
                description: 'Set of 3 ceramic plant pots in various sizes',
                price: 34.99,
                stock: 75,
                sku: 'HOME-IPP-001',
                isActive: true,
                categoryId: categories[2].id,
            },
        }),
        prisma.product.create({
            data: {
                name: 'LED Desk Lamp',
                description: 'Adjustable LED desk lamp with touch control and USB charging',
                price: 45.99,
                stock: 60,
                sku: 'HOME-LDL-002',
                isActive: true,
                categoryId: categories[2].id,
            },
        }),

        // Books
        prisma.product.create({
            data: {
                name: 'The Art of Programming',
                description: 'Comprehensive guide to modern software development',
                price: 39.99,
                stock: 100,
                sku: 'BOOK-TAP-001',
                isActive: true,
                categoryId: categories[3].id,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Data Structures Handbook',
                description: 'In-depth exploration of data structures and algorithms',
                price: 44.99,
                stock: 80,
                sku: 'BOOK-DSH-002',
                isActive: true,
                categoryId: categories[3].id,
            },
        }),

        // Sports & Outdoors
        prisma.product.create({
            data: {
                name: 'Yoga Mat Premium',
                description: 'Non-slip yoga mat with carrying strap, 6mm thickness',
                price: 29.99,
                stock: 120,
                sku: 'SPRT-YMP-001',
                isActive: true,
                categoryId: categories[4].id,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Running Shoes Elite',
                description: 'Lightweight running shoes with responsive cushioning',
                price: 129.99,
                stock: 40,
                sku: 'SPRT-RSE-002',
                isActive: false, // Inactive product example
                categoryId: categories[4].id,
            },
        }),
    ]);

    console.log(`✅ Created ${products.length} products`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`\nSummary:`);
    console.log(`  - Categories: ${categories.length}`);
    console.log(`  - Products: ${products.length}`);
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
