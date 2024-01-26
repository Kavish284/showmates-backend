const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default:''
  },
  email: {
    type: String,
    default:''
  },
  password: {
    type: String
  },
  phone: {
    type: String,
    default:''
  },
  birthdate:{
    type:String,
    default:''
  },
  active:{
    type:Boolean,
    default:true
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'organizer'],
    default: 'customer'
  },
  location: {
    type: String,
    default:''
  },
  promocodesCreated:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "promocodes",
    default:[]
  }],
  promocodesUsed:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "promocodes",
    default:[]
  }]


  
});

module.exports=mongoose.model("users",userSchema);