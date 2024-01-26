const bannerImagesModel = require('../models/bannerImagesSchema');

exports.saveBannerImages=async (req,res)=>{

  try {
    const webFiles = req.files['webBannerImages'];
    
    const mobileFiles = req.files['mobileBannerImages'];

    for (let i = 0; i < webFiles.length; i++) {
      const webFile = webFiles[i];
      const mobileFile = mobileFiles[i];

      // Create a new image object
      const newBannerImage = new bannerImagesModel({
       
        webBannerImagePath: webFile.path,
        mobileBannerImagePath: mobileFile.path,
        linkToBanner:req.body.linkToBanner
          
      });

      // Save the image object to the database
      await newBannerImage.save();
    }

    res.json({statusCode:200, message: 'Images uploaded successfully' });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.json({statusCode:-1,message: 'Error uploading images' });
  }
}

exports.getAllBannerImages = async (req,res)=>{
  try{  
    let result = await bannerImagesModel.find();
    if(result){
      res.json({statusCode:200,message:"images retrived successfully!",data:result});
    }
  }catch(error){
    console.log(error);
    res.json({statusCode:-1,message:"error retriving images!"});
  }

}  

exports.setBannerImageAsActive = async (req,res)=>{
  try{  
    // Find the image by ID in the database
    
    const image = await bannerImagesModel.findById(req.params.id);

    if (!image) {
      return res.json({statusCode:-1,message: 'Image not found' });
    }
    // Update the active status of the image
    image.active = true;
    
    // Save the updated image
    await image.save();
 
    res.json({ statusCode: 200, message: 'Image active status updated' });
  }catch(error){
    console.log(error);
    res.json({statusCode:-1,message:"error retriving image!"});
  }

}  

exports.deactivateBannerImage = async (req,res)=>{
  try{  
    // Find the image by ID in the database
    
    const image = await bannerImagesModel.findById(req.params.id);

    if (!image) {
      return res.json({statusCode:-1,message: 'Image not found' });
    }
    // Update the active status of the image
    image.active = false;
    
    // Save the updated image
    await image.save();
 
    res.json({ statusCode: 200, message: 'Image active status updated' });
  }catch(error){
    console.log(error);
    res.json({statusCode:-1,message:"error retriving image!"});
  }

}  

exports.deleteBannerImage =  async(req,res)=>{
  try{
    let result = await bannerImagesModel.findOneAndDelete({_id:req.params.id});
    
    if(result){
      res.json({statusCode:200,message:"image deleted successfully!",data:result});
    }
  }catch(error){
    console.log(error);
    res.json({statusCode:-1,message:"error deleting image!"});
  }
}

exports.getAllActiveBannerImages = async(req,res)=>{
  try{
    let result = await bannerImagesModel.find({active:true});
    if(result){
      res.json({statusCode:200,message:"images retrived successfully!",data:result});
    }
  }catch(error){
    console.log(error);
    res.json({statusCode:-1,message:"error retriving images!"});
  }
}
