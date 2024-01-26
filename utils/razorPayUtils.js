let Razorpay = require('razorpay');

var instance = new Razorpay({
    key_id: 'rzp_test_Q6VgEBeiTaljre',
    key_secret: 'RZgJLzL367LDMYjSPADC0FT5'
  });

let RazorpayConfig={
    key_id: 'rzp_test_Q6VgEBeiTaljre',
    key_secret: 'RZgJLzL367LDMYjSPADC0FT5'
}

module.exports.config = RazorpayConfig;
module.exports.instance = instance;