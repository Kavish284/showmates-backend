const {CashFreeConfig} = require('../utils/cashfreeConfig')
const axios = require('axios');
const { CFConfig, CFPaymentGateway, CFEnvironment, CFCustomerDetails, CFOrderRequest } = require("cashfree-pg-sdk-nodejs");

exports.generateToken = async(data,res) => {
  const url = 'https://test.cashfree.com/api/v2/cftoken/order';
  const headers = {
    'x-client-id': CashFreeConfig.app_id,
    'x-client-secret':CashFreeConfig.secret_key,
    'x-api-version': '2022-09-01',
    'Content-Type': 'application/json',
  };
  const dataToSend = {
    'orderId': data._id.toString(),
    'orderAmount': data.totalPrice,
    'orderCurrency': data.curency
  };
  //const postData = JSON.stringify(dataToSend);
  try{
  axios.post(url, dataToSend, {
    headers: headers
  })
    .then(response => {
      // Handle the response
      data.cftoken=response.data.cftoken;
      res.json({statusCode:200,message: "order created successfully",data:{order:data,cftoken:data.cftoken}})
    })
    .catch(error => {
      // Handle errors
      console.error('Error:', error.message);
    });}catch(e){
      console.log(e);
    }
}

exports.cashFreeOrderGen = async(req,res) =>{
  var cfConfig = new CFConfig(CFEnvironment.SANDBOX, "2022-09-01", "TEST429453eee136f3bfc22d18dae3354924", "TEST8abb791cd39236b4cb51ff35d5d04f6512b5db4f");
  const customerDetails = new CFCustomerDetails();
        customerDetails.customerId = "some_random_id";
        customerDetails.customerPhone = "9999999999";
        customerDetails.customerEmail = "b.a@cashfree.com";
        const d ={};
        d["order_tag_01"] = "TESTING IT";

    const cFOrderRequest = new CFOrderRequest();
            cFOrderRequest.orderAmount = 1;
            cFOrderRequest.orderCurrency = "INR";
            cFOrderRequest.customerDetails = customerDetails;
            cFOrderRequest.orderTags = d;
    try {
                    const apiInstance = new CFPaymentGateway();

                    const result = await apiInstance.orderCreate(
                        cfConfig,
                        cFOrderRequest
                    );
                    
                    if (result != null) {
                        await payWithCard(result?.cfOrder?.paymentSessionId);
                      
                        res.json({"statusCode":200,"message":"order created",data:{orderId:result?.cfOrder.orderId,sessionId:result?.cfOrder?.paymentSessionId}});
                    }
    } catch (ApiException) {
                console.log(ApiException);
                res.json({"statusCode":-1,"message":ApiException,data:null});
    }
}