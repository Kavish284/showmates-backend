const mongoose = require("mongoose");


const promocodeSchema = new mongoose.Schema({
    promocode: {
      type: String,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      default:'fixed',
     
    },
    value: {
      type: Number,
     
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // validFrom: {
    //   type: Date,
    //   required: true,
    // },
    // validUntil: {
    //   type: Date,
    //   required: true,
    // },
    maxUses: {
      type: Number,
      default: null, // Set a maximum number of uses, or null for unlimited
    },
});

const eventDateSchema = new mongoose.Schema({
    
    eventDate:{
        type:Date,
        required:true
    },
    eventStartTime:{
        type:String,
        
    },
    eventEndTime:{
        type:String
    },
    eventDuration:{
        type:String
    },
    eventTicketTypes:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:'ticket_type',
        default:[]
    },

},{
    _id:false
});

const eventSchema = new mongoose.Schema({
    eventTitle: {
        type: String,
        required: true
    },
    eventStatus: {
        type: String,
        enum: ["not-approved", "approved", "expired","live"],
        default: "not-approved",
    },
    eventDescription: {
        type: String,
        
    },
    eventCatagory: {
        type: String,
        required: true
    },
    eventLocation: {
        eventArea: {
            type: String
        },
        eventVenue: {
            type: String
        },
        eventPincode: {
            type: Number
        },
        eventAddress: {
            type: String
        },
        eventEmbeddedMapString: {
            type: String,
            default:''
        }
    },
    
    eventImages: {
        eventVenueImage: {
            type: String,
            default:''
        },
        eventCardImage: {
            type: String,
            default:''
        },
        eventBannerImage: {
            type: String,
            default:''
        }

    },
    eventAgeGroup: {
        type: String,
        required: true
    },
    eventSocialMediaLinks:{
        type:[String],
        default:[]
    },
    eventYtLink:{
        type:String,
        default:''
    },
    eventOrganizerName: {
        type: String,
        required: true
    },
    eventArtists:[ 
        {
            eventArtistName: {
                type: String
            },
            eventArtistImage: {
                type: String
            },
            _id:false
        }
    ],
    eventLanguages: {
        type: [String],
        required: true
    },
    eventTermsAndConditions: {
        type: [String],
        required: true
    },
    eventLikedBy: {
        type: [mongoose.Schema.Types.ObjectId],
        default:[]
    },
    eventLikeCount: {
        type: Number,
        default:0
    },
    eventOfflineSellers:[
        {
            eventOfflineSellerName:{
                type:String
            },
            eventOfflineSellerNumber:{
                type:String
            },
            _id:false
        }
    ],
    isMultiDateEvent:{
        type:Boolean,
        required:true
    },
    isMultiDateContinous:{
        type:Boolean,
        required:true
    },
    eventDates:{
        type:[eventDateSchema],
        default:[]
    },
    eventPromocodes:{
        type:[promocodeSchema],
        default:[]
    }, 
    eventCreatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    eventAvailableTicketTypes:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:'ticket_type',
        default:[]
    },
    isFeaturedEvent: {
        type: Boolean,
        default: false, // Set to false by default for all events
    },
    featuredEventPriority: {
        type: Number,
        default: 0, // Set a default priority (e.g., 0) for events that are not featured
    },
    isBookingOpen:{
        type:Boolean,
        default:true
    }  
},
    {
        timestamps: true
    }
);
module.exports= mongoose.model("events", eventSchema);