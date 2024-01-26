const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const bannerImageController = require('../controllers/bannerImageController');
const authMiddleware=require("../middleware/auth");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {

      const destinationPath='../uploads/banner-images';
    
      // Check if the destination path exists
      if (!fs.existsSync(destinationPath)) {
        // Create the destination directory if it doesn't exist
        fs.mkdirSync(destinationPath, { recursive: true });
      }
      cb(null, destinationPath); // Specify the destination folder to store the uploaded files
    },
    filename: (req, file, cb) => {
        const time = Date.now();
        const originalname = file.originalname;
        const extension = 'avif';
        const fileName = `banner_image_${time}_.${extension}`;
        
        cb(null, fileName);
      }
  });
  
const multerConfig = multer({ storage:storage });


router.post('/banner-images',authMiddleware.auth(['admin']),multerConfig.fields([
  { name: 'webBannerImages', maxCount: 10 },
  { name: 'mobileBannerImages', maxCount: 10 }
]),bannerImageController.saveBannerImages);
router.get('/getall-banner-images',authMiddleware.auth(['admin']),bannerImageController.getAllBannerImages);
router.get('/getall-active-banner-images',bannerImageController.getAllActiveBannerImages);
router.patch('/setimageactive/:id',authMiddleware.auth(['admin']),bannerImageController.setBannerImageAsActive);
router.patch('/deactivatebannerimage/:id',authMiddleware.auth(['admin']),bannerImageController.deactivateBannerImage);
router.delete('/deletebannerimage/:id',authMiddleware.auth(['admin']),bannerImageController.deleteBannerImage);



module.exports=router;
 
