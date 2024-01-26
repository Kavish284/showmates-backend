const mongoose = require("mongoose");

const listYourEventSchema = new mongoose.Schema({
    yourName:{
        type:String,
        required: true
    }, 
    yourContactNumber:{
        type:String,
        required: true
    },
    numberOfPass:{
        type:String,
        required:true
    },
  },
  {
    timestamps:true
  }
);

module.exports=mongoose.model("bookevent",bookventSchema);