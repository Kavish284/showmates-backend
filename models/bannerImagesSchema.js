const mongoose=require('mongoose');

const bannerImagesSchema=new mongoose.Schema({
    webBannerImagePath:{
        type:String,
        required:true
    },
    mobileBannerImagePath:{
        type:String,
        required:true
    },
    linkToBanner:{
        type:String,
        default:''
    },
    active:{
        type:Boolean,
        default:false
    }
},
    {
        timestamps:true
    }
);

module.exports=mongoose.model("banner_images",bannerImagesSchema);