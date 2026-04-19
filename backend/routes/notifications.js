const express = require('express');
const Notification = require('../models/Notification');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find({
            $or: [
                { userId: req.user._id },
                { roleTarget: req.user.role }
            ]
        }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch(err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/suggest', async (req, res) => {
    try {
        await Notification.create({
            roleTarget: 'admin',
            message: `User Suggestion from ${req.user.name}: "${req.body.suggestion}"`,
            type: 'order_request'
        });
        res.json({ success: true });
    } catch(err) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/:id/read', async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
