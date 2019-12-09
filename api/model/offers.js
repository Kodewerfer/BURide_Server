const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  seats: { type: Number, default: 1 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Offer', offerSchema);