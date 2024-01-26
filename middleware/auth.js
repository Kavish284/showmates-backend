const jwt = require('jsonwebtoken');
const userModel = require('../models/userSchema');

exports.auth =(roles)=>{ 
    return async (req,res,next)=>{

       const token = req.headers.authorization;
       
       if(!token){
        return res.json({statusCode:401,message:"unauthorized access!"});
       }

       try{
            const decodedToken = jwt.verify(token,"secret key");
            
            const user = await userModel.findById(decodedToken.id);
            
            if(!user){
                return res.json({statusCode:401,message:"invalid token!"});
            }

            if(!roles.includes(user.role)){
        
               
                return res.json({statusCode:401,message:"unauthorized access!"});
            }

            req.userId=user.id;
            next();
       }catch(error){
            console.log(error);
            res.json({statusCode:500,message:"internal server error!"});
       }
    }
}