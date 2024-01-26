const mongoose=require('mongoose');

const blogSchema=new mongoose.Schema({
    blogTitle:{
        type:String,
        required:true
    },
    blogContent:{
        type:String
    },
    blogHighlight:{
        type:String
    },
    blogImage:{
        type:String
    },
    blogStatus:{
        type:Boolean,
        default:false
    }
},
    {
        timestamps:true
    }
);

module.exports=mongoose.model("blogs",blogSchema);