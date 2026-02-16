import express from 'express';
import { getAllUsers, getUserById, getUserStats, deleteUser, updateUser } from '../controllers/userController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Admin user management routes
router.get('/admin/users', protect, admin, getAllUsers);
router.get('/admin/users/:id', protect, admin, getUserById);
router.get('/admin/users/:id/stats', protect, admin, getUserStats);
router.put('/admin/users/:id', protect, admin, updateUser);
router.delete('/admin/users/:id', protect, admin, deleteUser);

export default router;
