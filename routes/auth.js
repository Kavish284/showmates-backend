const router = require('express').Router();
const authController = require('../controllers/authController');
const authMiddleware=require("../middleware/auth");

// router.post("/signup",authController.signup);

router.post("/loginbyemailandpassword",authController.loginByEmailAndPassword);
router.post("/loginbyemail",authController.loginByEmail);
router.post("/loginbyphone",authController.loginByPhone);
router.post("/verifyemail",authController.verifyEmailForOrgAndAdmin);
router.post("/sendotp",authController.sendOTP);
module.exports=router;