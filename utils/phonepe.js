let PhonePeConfig={
    merchantId: 'SHOWONLINE',
    testMerchantId:'MERCHANTUAT',
    saltkey: 'b36bbc8a-dee4-4ce4-b23a-7bea3e5664dc',
    testSaltKey:'cbe98b90-8857-40d9-bbca-c78d0272e36f',
    prodUrl:'https://api.phonepe.com/apis/hermes/pg/v1/pay',
    testUrl:'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
    phonpeUrlLocal:'http://localhost:3000/order/initphonepe',
    phonpeUrlLive:'https://showmates.in:3000/order/initphonepe'
}

module.exports.PhonePeConfig = PhonePeConfig;