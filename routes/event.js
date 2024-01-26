const router=require('express').Router();
const eventController=require('../controllers/eventController');
const fs = require('fs');
//for handling files
const multer=require('multer');
const authMiddleware=require("../middleware/auth");

//configuring multer
const storage=multer.diskStorage({
    
        destination:(req,file,cb)=>{
    
            const destinationPath='../uploads/event-images';
            
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
            const extension = 'avif'
            const fileName = `event_image_${time}_.${extension}`;
            cb(null,fileName);
        }
    });
    const multerConfig = multer({
            storage:storage,
            limits:1024*1024*5,
            // fileFilter:fileFilter
        });
// const storageForCardImage=multer.diskStorage({
    
//     destination:(req,file,cb)=>{

//         const destinationPath='uploads/event/card-images';
        
//         // Check if the destination path exists
//         if (!fs.existsSync(destinationPath)) {
//             // Create the destination directory if it doesn't exist
//             fs.mkdirSync(destinationPath, { recursive: true });
//         }

//         cb(null,destinationPath);

//     },
//     filename:(req,file,cb)=>{
//         const time = Date.now();
//         const originalname = file.originalname;
//         const extension = originalname.split('.').pop();
//         const fileName = `card_image_${time}_.${extension}`;
//         cb(null,fileName);
//     }
// });

// const storageForBannerImage=multer.diskStorage({
    
//     destination:(req,file,cb)=>{

//         const destinationPath='uploads/event/banner-images';
       
//         // Check if the destination path exists
//         if (!fs.existsSync(destinationPath)) {
//             // Create the destination directory if it doesn't exist
//             fs.mkdirSync(destinationPath, { recursive: true });
//         }
//         cb(null,destinationPath);

//     },
//     filename:(req,file,cb)=>{
//         const time = Date.now();
//         const originalname = file.originalname;
//         const extension = originalname.split('.').pop();
//         const fileName = `banner_image_${time}_.${extension}`;
//         cb(null,fileName);
//     }
// });

// const storageForVenueImage=multer.diskStorage({
    
//     destination:(req,file,cb)=>{

//         const destinationPath='uploads/event/venue-images';
       
//         // Check if the destination path exists
//         if (!fs.existsSync(destinationPath)) {
//             // Create the destination directory if it doesn't exist
//             fs.mkdirSync(destinationPath, { recursive: true });
//         }
//         cb(null,destinationPath);

//     },
//     filename:(req,file,cb)=>{
//         const time = Date.now();
//         const originalname = file.originalname;
//         const extension = originalname.split('.').pop();
//         const fileName = `venue_image_${time}_.${extension}`;
//         cb(null,fileName);
//     }
// });

// const storageForArtistImages=multer.diskStorage({
    
//     destination:(req,file,cb)=>{

//         const destinationPath='uploads/event/artist-images';
       

//         // Check if the destination path exists
//         if (!fs.existsSync(destinationPath)) {
//             // Create the destination directory if it doesn't exist
//             fs.mkdirSync(destinationPath, { recursive: true });
//         }
//         cb(null,destinationPath);
//     },
//     filename:(req,file,cb)=>{
//         const time = Date.now();
//         const originalname = file.originalname;
//         const extension = originalname.split('.').pop();
//         const fileName = `artist_image_${time}_.${extension}`;
//         cb(null,fileName);
//     }
// });

const fileFilter = (req,file,cb)=>{
    if(file.mimetype=='image/jpeg' || file.mimetype=='image/png' || file.mimetype=='image/jpg'){
        cb(null,true);
    }else{
        cb(new Error("format should be jpeg or jpg or png only"),false);
    }
}
// const multerConfigForCardImage = multer({
//     storage:storageForCardImage,
//     // limits:1024*1024*5,
//     // fileFilter:fileFilter
// });
// const multerConfigForBannerImage = multer({
//     storage:storageForBannerImage,
//     // limits:1024*1024*5,
//     // fileFilter:fileFilter
// });     
// const multerConfigForVenueImage = multer({
//     storage:storageForVenueImage,
//     // limits:1024*1024*5,
//     // fileFilter:fileFilter
// });     
// const multerConfigForArtistImages = multer({
//     storage:storageForArtistImages,
//     fields: [
//         { name: 'eventArtistImages', maxCount: 10 }
//     ]
//     // limits:1024*1024*5,
//     // fileFilter:fileFilter
// });     
                       

                             
router.post("/addevent",authMiddleware.auth(['admin','organizer']),multerConfig.fields([
    { name: 'eventCardImage', maxCount: 1 },
    { name: 'eventBannerImage', maxCount: 1 },
    { name: 'eventVenueImage', maxCount: 1 },
    { name: 'eventArtistImages',maxCount: 10} 
]),eventController.addEvents);
router.get("/geteventbyid/:id",eventController.getEventById);
router.get("/geteventbyidForDetailsCustomer/:id",eventController.getEventByIdForDetailsCustomer);
router.get("/getgarbaeventshomepage",eventController.getGarbaHomePageEvents);
router.get("/getupcomingevents/:category/:day",eventController.getUpcomingEvents);
router.get("/geteventlikebyuser/:id",authMiddleware.auth(['admin','customer','organizer']),eventController.getEventsLikeByUser);
router.get("/getsimilarevents/:category",eventController.getSimilarEvent);
router.get("/geteventsbyarea/:area",eventController.getEventByArea);
router.get("/getsortedevent/:flag",eventController.getLowToHighEvents);
router.get("/geteventbyname/:name",eventController.getEventByEventName);
router.delete("/deleteevent/:id",authMiddleware.auth(['admin']),eventController.deleteEventById);
router.patch("/updateeventapproval/:id",authMiddleware.auth(['admin']),eventController.updateApprovalStatusForEvent);
router.patch("/updateeventlikeandcount/:id",authMiddleware.auth(['admin','organizer','customer']),eventController.updateEventLikedByAndEventLikeCount);
router.put("/updateeventdatesinevent",authMiddleware.auth(['admin','organizer']),eventController.updateEventDatesinEventData);
router.get("/geteventbyglobalsearch/:data",eventController.getEventByGlobalSearch);
router.put("/updateevent/:id",authMiddleware.auth(['admin','organizer']),multerConfig.fields([
    { name: 'eventCardImage', maxCount: 1 }, 
    { name: 'eventBannerImage', maxCount: 1 },
    { name: 'eventVenueImage', maxCount: 1 },
    { name: 'eventArtistImages', maxCount: 10 }
]),eventController.updateEvent);

router.get("/getalleventswithoffset/:offset",eventController.getAllEventsWithOffset);
router.get("/geteventsbyapprovalwithoffset/:status1/:status2/:offset",eventController.getEventsByApprovalStatusWithOffset);
router.get("/geteventbyuseridwithoffset/:id/:offset",eventController.getEventsByUserIdWithOffset);


router.get("/getallevents",eventController.getAllEvents);
router.get("/geteventsbyapproval/:status",eventController.getEventsByApprovalStatus);
router.get("/geteventbyuserid/:id",eventController.getEventsByUserId);

router.get("/geteventcountbyid/:id",authMiddleware.auth(['admin','organizer']),eventController.getEventsByOrganizerId);

//router.get("/makepasteventsfeatured",eventController.forMakingPastEventsFeatured);

//for admin/organizer
router.get("/customorder",eventController.fetchingDataForCustomOrder);
module.exports=router;
