const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'buyer'], default: 'buyer' },
  name: { type: String, required: true },
  company: { type: String },
  phoneNumber: { type: String, required: true },
  
  // Array of categories the buyer is approved to view and purchase from
  approvedCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],

  // Categories the buyer requested to access
  requestedCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  
  // Custom price modifiers map to give specific buyers discounts on specific categories/products
  customPriceModifiers: [{
      category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
      discountPercentage: { type: Number, required: true }
  }],
  
  // Status of their account - new users are unapproved by default (Lobby view)
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
