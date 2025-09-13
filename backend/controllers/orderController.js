import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const mockRazorpay = {
  orders: {
    create: async ({ amount, currency, receipt, notes }) => ({
      id: 'mock_order_' + Date.now(),
      amount,
      currency,
      receipt,
      notes
    })
  }
};

// Use mock or real Razorpay based on environment variables
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : mockRazorpay;

// ...existing code...

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { items } = req.body; // [{productId, quantity}]
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'No items to checkout' });
  }

  const dbProducts = await Product.find({ _id: { $in: items.map((i) => i.productId) } });
  const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

  let total = 0;
  const orderItems = [];
  for (const { productId, quantity } of items) {
    const p = productMap.get(productId);
    if (!p) return res.status(400).json({ message: 'Invalid product in cart' });
    if (p.stock < quantity) return res.status(400).json({ message: `Insufficient stock for ${p.name}` });
    total += p.price * quantity;
    orderItems.push({ product: p._id, name: p.name, price: p.price, quantity, image: p.image });
  }

  // Create order in database first
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalPrice: total,
    status: 'pending',
  });

  // Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(total * 100), // Convert to paise
    currency: 'INR',
    receipt: order._id.toString(),
    notes: {
      orderId: order._id.toString(),
      userId: req.user._id.toString(),
    },
  });

  // Update order with Razorpay order ID
  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  res.json({
    orderId: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
  
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
    return res.status(400).json({ message: 'Missing payment verification data' });
  }

  // Find the order
  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  // Verify the payment signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: 'Invalid payment signature' });
  }

  // Update order with payment details and mark as paid
  order.razorpayPaymentId = razorpay_payment_id;
  order.razorpaySignature = razorpay_signature;
  order.status = 'paid';
  await order.save();

  // Decrement stock for all items
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  res.json({ message: 'Payment verified successfully', order });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.status = req.body.status ?? order.status;
  const updated = await order.save();
  res.json(updated);
});


