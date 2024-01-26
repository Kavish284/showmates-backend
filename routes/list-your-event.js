const router=require('express').Router();
const listYourEventController=require('../controllers/listYourEventController');

const authMiddleware=require("../middleware/auth");
                             
router.post("/addlistyourevent",listYourEventController.addListYourEvents);
//router.get("/getlistyoureventbyid/:id",listYourEventController.getListYourEventById);
router.delete("/deletelistyourevent/:id",authMiddleware.auth(['admin']),listYourEventController.deleteListYourEventById);
router.get('/getalllistyourevents',authMiddleware.auth(['admin']),listYourEventController.getAllListYourEvents);

module.exports=router;