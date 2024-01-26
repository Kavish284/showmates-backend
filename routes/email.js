const router=require('express').Router();
const emailController=require('../controllers/emailController');


router.post("/organizerwelcomeemail",emailController.sendWelcomeEmailForOrganizer);
router.post("/customerwelcomeemail",emailController.sendWelcomeEmailForCustomer);
router.post("/organizereventaddeditemail",emailController.sendEventAddedByOrganizer);
router.post("/organizereventapprovedemail",emailController.sendEventApprovedByAdmin);
router.post("/emailotpverification",emailController.sendEmailForOtp);
router.post("/listyoureventmail",emailController.sendListYourEventMail);
router.post("/bookrequest",emailController.bookRequest);
router.post("/e-pass",emailController.sendEpass);
module.exports=router;