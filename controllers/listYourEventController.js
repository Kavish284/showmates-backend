const listYourEventModel=require("../models/listYourEventSchema");
const emailController = require("../controllers/emailController");

exports.addListYourEvents=async (req,res)=>{

    const newEvent=new listYourEventModel({
        yourName:req.body.yourName, 
        yourContactNumber:req.body.yourContactNumber, 
        yourEmail:req.body.yourEmail,
        eventCatagory:req.body.eventCatagory,
        numberOfPeople:req.body.numberOfPeople
    })
    try{
        
        let result=await newEvent.save();
        if(result){
            res.json({statusCode:200,message:"your request has been submitted,you will be contacted soon by showmates.Check your mail for details.",data:result});
        }else{
            res.json({statusCode:-1,message:"error requesting for listing your show,try again later!",data:null});
        }

    }catch(error){  
        res.json({statusCode:-1,message:"error requesting for listing your show,try again later!",data:null});
    }
     
}

exports.getListYourEventById= async (req,res)=>{
    try{
        let result=await listYourEventModel.findOne({_id:req.params.id});

        if(result){
            res.json({statusCode:200,message:"event fetched!",data:result});
        }else{
            res.json({statusCode:-1,message:"error fetching event",data:null});
        }    
    }catch(error){  
        res.json({statusCode:-2,message:"error fetching details,please try again later",data:null});
    }
}

exports.getAllListYourEvents= async (req,res)=>{
    try{
        let result=await listYourEventModel.find();

        
        if(result){
            res.json({statusCode:200,message:"event fetched!",data:result});
        }else{
            res.json({statusCode:-1,message:"error fetching event",data:null});
        }    
    }catch(error){  
        res.json({statusCode:-2,message:"error fetching details,please try again later",data:null});
    }
}


exports.deleteListYourEventById=async (req,res)=>{
 
    try{
        let result = await listYourEventModel.findByIdAndDelete({_id:req.params.id});
        res.json({statusCode:200,message:"Event deleted successfully!",data:result});
    }catch(error){
        res.json({statusCode:-1,message:error.message,data:null});
    }    
}