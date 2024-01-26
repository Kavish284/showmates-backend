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
    eventCatagory:{
        type:String,
        required: true
    },
    numberOfPeople:{
        type:String,
        required:true
    },
  },
  {
    timestamps:true
  }
);

module.exports=mongoose.model("listyourevent",listYourEventSchema);