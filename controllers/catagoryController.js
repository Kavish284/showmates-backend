const catagoryModel=require('../models/catagorySchema');

exports.addCatagories=async (req,res)=>{

    
    const newCatagory=new catagoryModel({
        catagoryName: req.body.catagoryName,
        catagoryDescription: req.body.catagoryDescription,
        catagoryImage: req.file.path
    })
    try{
        
        let result=await newCatagory.save();
        res.json({statusCode:200,message:"Catagory added successfully!",data:result});

    }catch(error){
        res.json({statusCode:-1,message:"error adding catagory,try after sometime!",data:null});
    }
    
}

exports.getCatagories=async (req,res)=>{
    try{
        let result =await catagoryModel.find();
        res.json({statusCode:200,message:"Catagories retrieved successfully!",data:result});
    }catch(error){
        console.log(error);
        res.json({statusCode:-1,message:error.message,data:null});
    }
}    

exports.getCatagoryById=async (req,res)=>{
   
    try{
        let result = await catagoryModel.findById({_id:req.params.id});
        res.json({statusCode:200,message:"Catagory details retrieved successfully!",data:result});
    }catch(error){
        res.json({statusCode:-1,message:error.message,data:null});
    }
}


exports.deleteCatagoryById=async (req,res)=>{
 
    try{
        let result = await catagoryModel.findByIdAndDelete({_id:req.params.id});
        res.json({statusCode:200,message:"Catagory deleted successfully!",data:result});
    }catch(error){
        res.json({statusCode:-1,message:error.message,data:null});
    }    
}

exports.updateCatagory=async (req,res)=>{
    try{
        if(req.file){
            let result = await catagoryModel.findOneAndUpdate(
            {_id:req.params.id},
            {
                catagoryName:req.body.catagoryName,
                catagoryDescription:req.body.catagoryDescription,
                catagoryImage:req.file.path
            },
            {new:true});
            res.json({statusCode:200,message:"Catagory updated successfully!",data:result});
        }else{
            
            let result = await catagoryModel.findOneAndUpdate(
            {_id:req.params.id},
            {
                catagoryName:req.body.catagoryName,
                catagoryDescription:req.body.catagoryDescription,
            },{new:true});
            res.json({statusCode:200,message:"Catagory updated successfully!",data:result});
        }
    }catch(error){
        res.json({statusCode:-1,message:error.message,data:null});
    }
}