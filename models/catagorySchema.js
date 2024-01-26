const mongoose=require('mongoose');

const catagorySchema=new mongoose.Schema({
    catagoryName:{
        type:String,
        required:true
    },
    catagoryDescription:{
        type:String
    },
    catagoryImage:{
        type:String
    }
},
    {
        timestamps:true
    }
);

module.exports=mongoose.model("catagories",catagorySchema);