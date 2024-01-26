    const blogModel=require('../models/blogSchema');

    exports.addBlog=async (req,res)=>{

        
        const newBlog=new blogModel({
            blogTitle: req.body.blogTitle,
            blogContent: req.body.blogContent,
            blogHighlight:req.body.blogHighlight,
            blogImage: req.file.path
        })
        try{
            
            let result=await newBlog.save();
            res.json({statusCode:200,message:"Blog added successfully!",data:result});

        }catch(error){ 
            res.json({statusCode:-1,message:"error adding blog,try after sometime!",data:null});
        }
        
    }

    exports.getAllBlogs=async (req,res)=>{
        try{
            let result =await blogModel.find();
            res.json({statusCode:200,message:"Blogs retrieved successfully!",data:result});
        }catch(error){
            console.log(error);
            res.json({statusCode:-1,message:error.message,data:null});
        }
    }    

    exports.getBlogById=async (req,res)=>{
    
        try{
            console.log(req.query.id);
            let result = await blogModel.findById({_id:req.params.id});
            res.json({statusCode:200,message:"Blog details retrieved successfully!",data:result});
        }catch(error){
            res.json({statusCode:-1,message:error.message,data:null});
        }
    }


    exports.deleteBlogById=async (req,res)=>{
    
        try{
            let result = await blogModel.findByIdAndDelete({_id:req.params.id});
            res.json({statusCode:200,message:"Blog deleted successfully!",data:result});
        }catch(error){
            res.json({statusCode:-1,message:error.message,data:null});
        }    
    }
    exports.changeBlogStatus = async(req,res)=>{

        try{
        const {blogStatus}=req.body;
    
        let blog = await blogModel.updateOne({_id:req.params.id},{blogStatus:blogStatus});
        
        if (!blog) {
            return res.json({statusCode:-1,message: 'blog not found,error updating blog' });
        }
        return res.json({statusCode:200,message:"blog status updated"});
        }catch(error){
            console.log(error);
        return res.json({statusCode:-1,message:"error updating blog"});
        }
    }

    exports.updateBlog=async (req,res)=>{
        try{
            if(req.file){
                let result = await blogModel.findOneAndUpdate(
                {_id:req.params.id},
                {
                    blogTitle:req.body.blogTitle,
                    blogContent:req.body.blogContent,
                    blogHighlight:req.body.blogHighlight,
                    blogImage:req.file.path
                },
                {new:true});
                res.json({statusCode:200,message:"Blog updated successfully!",data:result});
            }else{
                
                let result = await blogModel.findOneAndUpdate(
                    {_id:req.params.id},
                    {
                        blogTitle:req.body.blogTitle,
                        blogContent:req.body.blogContent,
                        blogHighlight:req.body.blogHighlight
                    },
                    {new:true});
                res.json({statusCode:200,message:"Blog updated successfully!",data:result});
            }
        }catch(error){
            console.log(error);
            res.json({statusCode:-1,message:error.message,data:null});
        }
    }