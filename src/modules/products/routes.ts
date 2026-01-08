import { Router } from 'express';
import { productController } from './controllers';

// ==========================================
// Product Routes
// ==========================================
const router = Router();

// GET /api/products - Get all products
router.get('/', productController.getAll);

// GET /api/products/:id - Get product by ID
router.get('/:id', productController.getById);

// POST /api/products - Create a new product
router.post('/', productController.create);

// PUT /api/products/:id - Update a product
router.put('/:id', productController.update);

// DELETE /api/products/:id - Delete a product
router.delete('/:id', productController.delete);

// PATCH /api/products/:id/toggle-active - Toggle product active status
router.patch('/:id/toggle-active', productController.toggleActive);

export default router;
