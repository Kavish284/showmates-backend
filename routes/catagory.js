const router=require('express').Router();
const fs = require('fs');
const catagoryController=require('../controllers/catagoryController');
//for handling files
const multer=require('multer');
const authMiddleware=require("../middleware/auth");

//configuring multer
const storage=multer.diskStorage({
    
    destination:(req,file,cb)=>{

        const destinationPath='../uploads/catagory-images';
       
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
        const fileName = `catagory_image_${time}_.${extension}`;
        cb(null,fileName);
    }
});


const multerConfig = multer({
    storage:storage, 
    // limits:1024*1024*5,
    // fileFilter:fileFilter
});

router.post("/addcatagory",authMiddleware.auth(['admin']),multerConfig.single('catagoryImage'),catagoryController.addCatagories);
router.get("/getcatagorybyid/:id",authMiddleware.auth(['admin']),catagoryController.getCatagoryById);
router.get("/getcatagories",catagoryController.getCatagories);
router.delete("/deletecatagory/:id",authMiddleware.auth(['admin']),catagoryController.deleteCatagoryById);
router.put("/updatecatagory/:id",authMiddleware.auth(['admin']),multerConfig.single('catagoryImage'),catagoryController.updateCatagory);

module.exports=router;