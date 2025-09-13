import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/razorpay', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);
router.get('/my', protect, getMyOrders);

router.get('/', protect, admin, getAllOrders);
router.put('/:id', protect, admin, updateOrderStatus);

export default router;


