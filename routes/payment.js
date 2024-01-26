const router=require('express').Router();
const paymentController=require('../controllers/paymentController');

router.post('/generate',paymentController.generateToken);
router.post('/create-payment',paymentController.createPayment);
router.get('/initiatePayment', paymentController.cashFreeOrderGen);
router.post('/paytmCallback',paymentController.callback);

module.exports=router;
