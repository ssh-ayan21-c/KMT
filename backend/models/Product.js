const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  
  basePrice: { type: Number, required: true },
  stockQuantity: { type: Number, required: true, default: 0 },
  moq: { type: Number, default: 1 },
  
  imageUrl: { type: String, default: '' },
  details: { type: String, default: '' },
  
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
