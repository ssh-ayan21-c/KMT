const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, targeted specifically
  roleTarget: { type: String, enum: ['admin', 'buyer'] }, // Target an entire tier if userId missing
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  type: { type: String, enum: ['order_request', 'order_status', 'access_request', 'access_granted'], default: 'order_status' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
