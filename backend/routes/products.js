const express = require('express');
const Product = require('../models/Product');
const { requireAuth } = require('../middleware/authMiddleware');
const { enforceCatalogAccess } = require('../middleware/catalogMiddleware');

const router = express.Router();

router.get('/', requireAuth, enforceCatalogAccess, async (req, res) => {
    try {
        const products = await Product.find(req.categoryFilter).populate('category');
        
        // Map products and apply custom discount from req.user
        const modProducts = products.map(p => {
             let basePrice = p.basePrice;
             // find discount
             let customMod = req.user?.customPriceModifiers?.find(m => m.category.toString() === p.category._id.toString());
             if (customMod) {
                 basePrice = basePrice * (1 - (customMod.discountPercentage/100));
             }
             return { ...p.toObject(), basePrice };
        });

        res.json(modProducts);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
