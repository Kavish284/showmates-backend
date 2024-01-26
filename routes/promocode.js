const router=require('express').Router();
const promocodeController=require('../controllers/promocodeController');


router.post("/addpromocode",promocodeController.addPromoCodeByUser);
// router.patch("updatetikcetsforpromocode",promocodeController.updateAssociatedTickets);
router.delete("/deletepromocode/:promocodeId",promocodeController.deletePromoCode);
router.get("/getpromocodebyuser/:userId",promocodeController.getPromocodeByUser);
router.patch("/changepromocodestatus",promocodeController.changePromocodeStatus);
router.get("/getpromocodebyid/:promocodeId",promocodeController.getPromocodeById);
module.exports=router;