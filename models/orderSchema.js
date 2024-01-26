const mongoose = require('mongoose');
const moment = require('moment-timezone');
const ticketTypeSchema = require('./ticketTypeSchema');

// Define the Booking Schema
const orderSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "events",
    required: true
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  regularOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Orders', required: false },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  tickets: [
    {
      ticket: { type: ticketTypeSchema.schema, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  seasonPassOrder: { type: Boolean, required: true, defalut: false },
  ticketDate: { type: Date, require: true },
  totalPrice: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  paymentStatus: { type: String, enum: ['pending', 'success', 'refunded','failed'], required: true, default: 'pending' },
  ticketQrCode: { type: String, default: '' },
  isValid: { type: Boolean, required: true, default: false },
  isOfflineOrder: { type: Boolean }

});

const Order = mongoose.model('Orders', orderSchema);

module.exports = Order;
