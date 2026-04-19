const mongoose = require('mongoose');

const orderRequestSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    requestedPrice: { type: Number, required: true }
  }],
  
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  
  shippingAddress: { type: String, required: true },
  billingAddress: { type: String, required: true },
  rejectionReason: { type: String, default: '' },
  salesmanNotes: { type: String },
  buyerNotes: { type: String },
  totalEstimatedValue: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('OrderRequest', orderRequestSchema);
