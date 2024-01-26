  const mongoose = require("mongoose");

  const promoCodeSchema = new mongoose.Schema({
    promocode: {
      type: String,
    },
    description:{
      type:String
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "fixed",
    },
    value: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxUses: {
      type: Number,
      default: null,
    },
    associatedTickets: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "ticket_type",
      default:[]
    }],
    associatedUser:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'users',
      default:null
    }
  }, {
    timestamps: true,
  });

  module.exports = mongoose.model("promocodes", promoCodeSchema);