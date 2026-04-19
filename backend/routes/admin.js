const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const OrderRequest = require('../models/OrderRequest');
const Notification = require('../models/Notification');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/users/requests', async (req, res) => {
    try {
        const users = await User.find({ role: 'buyer' })
             .populate('requestedCategories')
             .populate('approvedCategories')
             .populate('customPriceModifiers.category');
        res.json(users);
    } catch(err) { res.status(500).json({error: 'Server error'}) }
});

router.put('/users/:userId/access', async (req, res) => {
    try {
        const { isApproved, approvedCategories } = req.body;
        const user = await User.findByIdAndUpdate(req.params.userId, { isApproved, approvedCategories }, { new: true });
        
        if (isApproved) {
            await Notification.create({
                userId: user._id,
                message: `Hello ${user.name}, your account access has been explicitly approved! You now have access to ${approvedCategories.length} specific categories.`,
                type: 'access_granted'
            });
        }
        
        const populatedUser = await User.findById(user._id)
             .populate('requestedCategories')
             .populate('approvedCategories')
             .populate('customPriceModifiers.category');
             
        res.json(populatedUser);
    } catch(err) { 
        console.error("Access Route Error:", err);
        res.status(500).json({error: 'Server error', details: err.message}) 
    }
});

router.post('/users/:userId/pricing', async (req, res) => {
     try {
         const { category, discountPercentage } = req.body;
         const user = await User.findById(req.params.userId).populate('customPriceModifiers.category');
         
         const existingIndex = user.customPriceModifiers.findIndex(m => m.category._id.toString() === category || m.category.toString() === category);
         if (existingIndex > -1) {
              user.customPriceModifiers[existingIndex].discountPercentage = discountPercentage;
         } else {
              user.customPriceModifiers.push({ category, discountPercentage });
         }
         await user.save();
         
         // Notify the user about their exact discount!
         const catRecord = await Category.findById(category);
         await Notification.create({
             userId: user._id,
             message: `Special Profile Pricing: An Admin just granted you a ${discountPercentage}% discount on ${catRecord.name}!`,
             type: 'access_granted'
         });

         const populatedUser = await User.findById(user._id)
             .populate('requestedCategories')
             .populate('approvedCategories')
             .populate('customPriceModifiers.category');

         res.json(populatedUser);
     } catch(err) { 
         console.error("Pricing Route Error:", err);
         res.status(500).json({error: 'Server error', details: err.message}) 
     }
});
// Impersonate removed as requested
router.put('/orders/:id/status', async (req, res) => {
    try {
        const { status, reason } = req.body;
        const order = await OrderRequest.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        order.status = status;
        if (reason) order.rejectionReason = reason;
        await order.save();

        if (status === 'accepted') {
            await Notification.create({
                userId: order.buyer,
                message: `Order ORD-${order._id.toString().substring(order._id.toString().length-4)} has been formally accepted by the Sales team and is now being processed!`,
                type: 'order_status'
            });
        } else if (status === 'rejected') {
            await Notification.create({
                userId: order.buyer,
                message: `Order ORD-${order._id.toString().substring(order._id.toString().length-4)} was unfortunately rejected.\nReason: ${reason}`,
                type: 'order_status'
            });
        }

        res.json(order);
    } catch(err) { res.status(500).json({ error: 'Server error' }); }
});

router.get('/orders', async (req, res) => {
    try {
        const orders = await OrderRequest.find().populate('buyer').populate('items.product');
        res.json(orders);
    } catch(err) { res.status(500).json({error: 'Server error'}) }
});

router.post('/categories', async (req, res) => {
    try {
        const { name } = req.body;
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        const category = await Category.create({ name, slug });
        res.status(201).json(category);
    } catch(err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/products', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch(err) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(product);
    } catch(err) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch(err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
