const mongoose=require('mongoose');


const whatsappNumberSchema=new mongoose.Schema({
    whatsappNumber:{
        type:String,
        required:true
    },
},
    {
        timestamps:true
    }
);

module.exports=mongoose.model("whatsapp_number",whatsappNumberSchema);