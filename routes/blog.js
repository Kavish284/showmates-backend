const router=require('express').Router();
const fs = require('fs');
const blogController = require('../controllers/blogController');
//for handling files
const multer=require('multer');
const authMiddleware=require("../middleware/auth");

//configuring multer
const storage=multer.diskStorage({
    
    destination:(req,file,cb)=>{

        const destinationPath='../uploads/blog-images';
       
        // Check if the destination path exists
        if (!fs.existsSync(destinationPath)) {
            // Create the destination directory if it doesn't exist
            fs.mkdirSync(destinationPath, { recursive: true });
        }

        cb(null,destinationPath);
    },
    filename:(req,file,cb)=>{
        const time = Date.now();
        const originalname = file.originalname;
        const extension = originalname.split('.').pop();
        const fileName = `blog_image_${time}_.${extension}`;
        cb(null,fileName);
    }
});


const multerConfig = multer({
    storage:storage, 
    // limits:1024*1024*5,
    // fileFilter:fileFilter
});

router.post("/addblog",authMiddleware.auth(['admin']),multerConfig.single('blogImage'),blogController.addBlog);
router.get("/getblogbyid/:id",blogController.getBlogById);
router.get("/getallblogs",blogController.getAllBlogs);
router.delete("/deleteblog/:id",authMiddleware.auth(['admin']),blogController.deleteBlogById);
router.put("/updateblog/:id",authMiddleware.auth(['admin']),multerConfig.single('blogImage'),blogController.updateBlog);
router.patch("/changeblogstatus/:id",authMiddleware.auth(['admin']),blogController.changeBlogStatus);

module.exports=router;