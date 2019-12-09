const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true },
  seats: { type: Number, default: 1 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

module.exports = mongoose.model('Order', orderSchema);