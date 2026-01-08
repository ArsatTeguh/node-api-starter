import { Router } from 'express';
import { categoryController } from './controllers';

// ==========================================
// Category Routes
// ==========================================
const router = Router();

// GET /api/categories - Get all categories
router.get('/', categoryController.getAll);

// GET /api/categories/:id - Get category by ID
router.get('/:id', categoryController.getById);

// POST /api/categories - Create a new category
router.post('/', categoryController.create);

// PUT /api/categories/:id - Update a category
router.put('/:id', categoryController.update);

// DELETE /api/categories/:id - Delete a category
router.delete('/:id', categoryController.delete);

export default router;