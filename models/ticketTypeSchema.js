

const mongoose = require("mongoose");

const ticketTypeSchema = new mongoose.Schema({

    ticketTitle:{
        type:String,
        required:true
    },
    ticketDescription:{
        type:String
    },
    ticketPrice:{
        type:Number,
        required:true,
        min:0
    },
    ticketCurrency:{
        type:String,
        required:true
    },
    totalAvailableTickets:{
        type:Number,
        default:0,
        required:true 
    },
    ticketsSold: {
        type: Number,
        default: 0
    },
    ticketStatus:{
        type:String,
        enum:['active','inactive','sold-out','expired'],
        default:'inactive'
    },
    isSeasonPass:{
        type:Boolean,
        default:false
    },
    allowedPerson:{
        type:Number,
        required:true
    },
    eventForTicket:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "events", 
        required: true
    },
    ticketPriorityNumber:{
        type:Number,
        default:1
    },
    promoCodes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "promocodes",
      }],
      originalPrice:{
        type:Number,
        min:0,
        default:0
      }
},
{
    timestamps:true
});

// ticketTypeSchema.post('findOneAndDelete', async  (doc, next) => {
   
//     // Remove the eventForTicket from the ticket_type array, if exists
//     const eventId = doc.eventForTicket;
//     try {
//       const event = await mongoose.model('events').findById(eventId);
//       if (event) {
//         event.eventTickets.pull(doc._id);
//         await event.save();
//       }
//       next();
//     } catch (err) {
//       next(err);
//     }
// });

module.exports = mongoose.model("ticket_type", ticketTypeSchema);