const express = require('express');
const OrderRequest = require('../models/OrderRequest');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/request', requireAuth, async (req, res) => {
    try {
        const payload = {
            buyer: req.user._id,
            items: req.body.items,
            shippingAddress: req.body.shippingAddress,
            billingAddress: req.body.billingAddress,
            totalEstimatedValue: req.body.items.reduce((acc, i) => acc + (i.requestedPrice * i.quantity), 0)
        };
        const orderRequest = new OrderRequest(payload);
        await orderRequest.save();

        const Notification = require('../models/Notification');
        await Notification.create({
            roleTarget: 'admin',
            message: `A new Order Request (ORD-${orderRequest._id.toString().substring(orderRequest._id.toString().length-4)}) has been submitted by ${req.user.name}. Value: $${payload.totalEstimatedValue.toFixed(2)}`,
            type: 'order_request'
        });

        res.status(201).json(orderRequest);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/my-requests', requireAuth, async (req, res) => {
    try {
        const orders = await OrderRequest.find({ buyer: req.user._id }).populate('items.product');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
