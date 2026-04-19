const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const OrderRequest = require('./models/OrderRequest');

async function seedDatabase() {
    try {
        console.log('Seeding memory database...');
        
        // Clear collections just in case
        await User.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});
        await OrderRequest.deleteMany({});

        // Create 8 Categories natively
        const cEngine = await Category.create({ name: 'Engine Components', slug: 'engine' });
        const cExterior = await Category.create({ name: 'Exterior & Bodywork', slug: 'exterior' });
        const cElectrical = await Category.create({ name: 'Electrical & Lighting', slug: 'electrical' });
        const cSuspension = await Category.create({ name: 'Suspension & Steering', slug: 'suspension' });
        const cBrakes = await Category.create({ name: 'Braking Systems', slug: 'brakes' });
        const cInterior = await Category.create({ name: 'Interior Accessories', slug: 'interior' });
        const cTools = await Category.create({ name: 'Diagnostic Tools', slug: 'tools' });
        const cConsumables = await Category.create({ name: 'Oils & Consumables', slug: 'consumables' });
        
        // Seed Products mapping them across the 8 categories + adding MOQs
        await Product.create([
            { sku: 'ENG-001', name: 'Forged Piston Set v2', basePrice: 240.00, stockQuantity: 50, moq: 5, category: cEngine._id, details: 'Ultra-lightweight forged pistons for 2.0L turbocharged setups.', imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&q=80' },
            { sku: 'ENG-002', name: 'High Flow Fuel Injectors (6-pack)', basePrice: 420.00, stockQuantity: 200, moq: 10, category: cEngine._id, details: 'Precision bored 1050cc injectors optimized for E85.', imageUrl: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=600&q=80' },
            { sku: 'ENG-003', name: 'Titanium Valve Springs', basePrice: 90.00, stockQuantity: 500, moq: 50, category: cEngine._id, details: 'High-rev tolerance inner and outer titanium valve springs.', imageUrl: 'https://images.unsplash.com/photo-1590656364026-6701bbcfcb93?w=600&q=80' },
            
            { sku: 'EXT-101', name: 'Carbon Fiber Hood', basePrice: 650.00, stockQuantity: 15, moq: 1, category: cExterior._id, details: 'Dry carbon fiber aero hood with integrated heat extractors.', imageUrl: 'https://images.unsplash.com/photo-1611821415448-b4b12aaae827?w=600&q=80' },
            { sku: 'EXT-102', name: 'LED Tail Light Assembly', basePrice: 180.00, stockQuantity: 60, moq: 5, category: cExterior._id, details: 'Smoked sequential LED tail lamps.', imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&q=80' },
            
            { sku: 'ELE-201', name: 'Lithium Deep Cycle Battery', basePrice: 180.00, stockQuantity: 40, moq: 5, category: cElectrical._id, details: 'Lightweight lithium-ion battery with built-in jumpstarter.', imageUrl: 'https://images.unsplash.com/photo-1605374465451-b844bf83df7f?w=600&q=80' },
            { sku: 'ELE-202', name: 'HID Headlight Ballast 55W', basePrice: 45.00, stockQuantity: 300, moq: 20, category: cElectrical._id, details: 'Slim digital HID ballast delivering true 55W continuous output.', imageUrl: 'https://images.unsplash.com/photo-1531649938927-44c180da1d0a?w=600&q=80' },

            { sku: 'SUS-301', name: 'Adjustable Coilovers Kit', basePrice: 850.00, stockQuantity: 20, moq: 2, category: cSuspension._id, details: '32-way adjustable damping coilover suspension.', imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80' },
            { sku: 'SUS-302', name: 'Polyurethane Bushing Set', basePrice: 60.00, stockQuantity: 150, moq: 10, category: cSuspension._id, details: 'Complete structural polyurethane chassis bushing replacement.', imageUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&q=80' },

            { sku: 'BRK-401', name: 'Carbon Ceramic Rotors', basePrice: 1200.00, stockQuantity: 10, moq: 2, category: cBrakes._id, details: 'Two-piece drilled carbon ceramic performance rotors.', imageUrl: 'https://images.unsplash.com/photo-1615557960916-5f4791effe9d?w=600&q=80' },
            { sku: 'BRK-402', name: 'Racing Brake Pads (Front)', basePrice: 95.00, stockQuantity: 100, moq: 10, category: cBrakes._id, details: 'High-friction temperature-resistant compounding brake pads.', imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&q=80' },

            { sku: 'INT-501', name: 'Racing Bucket Seat', basePrice: 350.00, stockQuantity: 25, moq: 2, category: cInterior._id, details: 'FIA-approved lightweight fiberglass shell racing seat.', imageUrl: 'https://images.unsplash.com/photo-1596706059296-857e4c6c21e7?w=600&q=80' },
            { sku: 'INT-502', name: 'Alcantara Steering Wheel', basePrice: 220.00, stockQuantity: 40, moq: 5, category: cInterior._id, details: '330mm diameter flat bottom steering wheel wrapped in genuine alcantara.', imageUrl: 'https://images.unsplash.com/photo-1601625902010-8eed9eb7d12f?w=600&q=80' },

            { sku: 'TOL-601', name: 'OBD2 Wireless Scanner', basePrice: 35.00, stockQuantity: 500, moq: 20, category: cTools._id, details: 'Bluetooth 5.0 ELM327 diagnostic scanner for smartphone integration.', imageUrl: 'https://images.unsplash.com/photo-1623018035782-b269248df596?w=600&q=80' },
            { sku: 'TOL-602', name: 'Professional Torque Wrench 1/2"', basePrice: 145.00, stockQuantity: 60, moq: 5, category: cTools._id, details: 'Calibrated digital torque wrench reaching up to 250 ft-lbs.', imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80' },

            { sku: 'CON-701', name: 'Synthetic Motor Oil 5W-30 (1 Qt)', basePrice: 8.50, stockQuantity: 1000, moq: 120, category: cConsumables._id, details: 'Full synthetic endurance tier oil. Sold in wholesale crate increments (120 quarts).', imageUrl: 'https://images.unsplash.com/photo-1631526620580-b2866b17c5b3?w=600&q=80' },
            { sku: 'CON-702', name: 'DOT 4 Racing Brake Fluid', basePrice: 22.00, stockQuantity: 250, moq: 12, category: cConsumables._id, details: 'Ultra-high dry boiling point (600°F) brake fluid.', imageUrl: 'https://plus.unsplash.com/premium_photo-1664297855013-176c49618b6e?w=600&q=80' }
        ]);

        const hash = await bcrypt.hash('password123', 10);
        
        await User.create({ email: 'mekranikamran@gmail.com', name: 'Kamran Mekrani', role: 'admin', passwordHash: hash, isApproved: true, phoneNumber: '+91 99999 88888' });
        // buyer user sees everything out of the gate for demoing
        await User.create({ email: 'approved@demo.com', name: 'Ayan Customs AutoShop', company: 'Ayan Customs', role: 'buyer', passwordHash: hash, isApproved: true, approvedCategories: [cEngine._id, cExterior._id, cConsumables._id], phoneNumber: '+91 88888 77777' });
        await User.create({ email: 'buyer@demo.com', name: 'Los Santos Motors', company: 'LS Motors Corp', role: 'buyer', passwordHash: hash, isApproved: false, requestedCategories: [cElectrical._id, cSuspension._id], phoneNumber: '+91 77777 66666' });

        console.log('Database seeded successfully!');
        console.log('Admin account: mekranikamran@gmail.com / password123');
        console.log('Approved Buyer: approved@demo.com / password123');
        console.log('Pending Buyer: buyer@demo.com / password123');
    } catch (error) {
        console.error('Seeding error:', error);
    }
}

module.exports = seedDatabase;
