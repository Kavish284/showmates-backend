const router=require("express").Router();
const orderController = require('../controllers/orderController');
const authMiddleware=require("../middleware/auth");

router.get("/initphonepe",orderController.payPhone);
router.post("/success",orderController.paymentSuccess);
router.post("/initorder",orderController.initilizeOrder);
router.post("/updateuserid",orderController.updateUserId);
router.post("/create-qr",orderController.createQRCode);
router.post("/qrcode",orderController.getQrCode);
router.get("/getorderbyid/:id",orderController.getOrderByid);
router.get("/getorderbyuserid/:id",orderController.getOrderByUserid);
router.post("/e-pass",orderController.createEPass);
router.post("/freeEventQrGeneration",orderController.freeEventQrGeneration);
router.get("/getorderbyeventid/:id",orderController.getOrderByEventid);
router.get("/getpreviousorderbyuserid/:id",orderController.getPreviousOrderByUserid);
router.post("/validateticket",orderController.scanQrCodeForEntry);


//for admin/organizer
router.post("/placecustomorder",orderController.placeCustomOrder);
router.get("/getallofflineorders",orderController.getAllOfflineOrders);
router.delete("/deletecustomorder/:orderId",orderController.deleteCustomOrder);

module.exports=router;	