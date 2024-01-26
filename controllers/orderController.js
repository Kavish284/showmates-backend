const Order = require('../models/orderSchema')
const paymentController = require('../controllers/paymentController')
const qrcode = require('qrcode');
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');
const https = require('https');
const { PhonePeConfig } = require('../utils/phonepe');
const crypto = require('crypto');
const { default: axios } = require('axios');
const { log } = require('console');
const { stringify } = require('querystring');
const moment = require('moment-timezone');
const ticketTypeSchema = require('../models/ticketTypeSchema');
const eventModel = require('../models/eventSchema');
const emailController = require('./emailController');
const mongoose = require("mongoose");


//run the url
exports.payPhone = async (req, res) => {
  liveDomain = 'https://showmates.in:3000/';
  localDomain = 'http://localhost:3000/';
  const amount = req.query.amount;
  const merchantUserId = req.query.merchantUserId;
  const merchantTransactionId = req.query.merchantTransactionId;
  const jsonData = {
    "merchantId": PhonePeConfig.testMerchantId,
    "merchantTransactionId": merchantTransactionId,
    "merchantUserId": merchantUserId,
    "amount": amount * 100,
    "redirectUrl": localDomain + "order/success",
    "redirectMode": "POST",
    "callbackUrl": localDomain + "order/success",
    "paymentInstrument": { "type": "PAY_PAGE" }
  };
  const saltKey = PhonePeConfig.testSaltKey;
  const b64 = btoa(JSON.stringify(jsonData));
  const sha = crypto.createHash('sha256').update(`${b64}/pg/v1/pay${saltKey}`).digest('hex');
  const url = PhonePeConfig.testUrl;
  const requestBody = { request: b64 };

  // Define the headers
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-VERIFY': sha + '###1',
  };

  // Create an Axios instance with custom headers
  const instance = axios.create({
    baseURL: url,
    headers: headers,
  });

  // Make the HTTP POST request
  instance
    .post('', requestBody)
    .then((response) => {
      const responseData = response.data;
      const redirectUrl = responseData.data.instrumentResponse.redirectInfo.url;
      res.redirect(302, redirectUrl);
    })
    .catch((error) => {
      console.error('Error:', error);
    });

}

exports.paymentSuccess = async (req, res) => {

  try {
    const code = req.body.code;
    const transactionId = req.body.transactionId;

    liveDomain = 'https://showmates.in/';
    localDomain = 'http://localhost:4200/';
    
    if (code === "PAYMENT_SUCCESS") {

      const order = await Order.findById(transactionId);

      if (order.seasonPassOrder && order.regularOrderId) {
        const result1 = await updateOrderStatusForSuccess(transactionId);
        const result2 = await updateOrderStatusForSuccess(order.regularOrderId);
        const qrGenerated1 = await this.createQRCode(transactionId);
        const qrGenerated2 = await this.createQRCode(order.regularOrderId.toString());

        if (result1 && result2 && qrGenerated1 && qrGenerated2) {
          res.redirect(302, localDomain + "tickets");
        }
        else
          res.redirect(302, localDomain + "error");
      }
      else {
        const result = await updateOrderStatusForSuccess(transactionId);
        const qrGenerated = await this.createQRCode(transactionId);

        if (result && qrGenerated)
          res.redirect(302, localDomain + "tickets");
        else
          res.redirect(302, localDomain + "error");
        if (result)
          res.status(200).send();
        else
          res.status(400).send();
      }
    }
    else {

      const result = await updateOrderStatusForFailed(transactionId);
      res.redirect(302, localDomain);
    }
  }
  catch (err) {
    console.log(err);
    const result = await updateOrderStatusForFailed(transactionId);
    res.redirect(302, localDomain);
  }
}


updateOrderStatusForSuccess = async (mId) => {
  try {
    const result = await Order.findById(mId)
    
    //not updating tickets sold if order is offline
    if (result && !result.isOfflineOrder) {
      for (const ticket of result.tickets) {
        const res = await ticketTypeSchema.findOneAndUpdate({_id:ticket.ticket._id}, { $inc: { ticketsSold: ticket.quantity } },{new:true});
      }
    }

    const orderData = await Order.findOneAndUpdate({_id:mId}, { "paymentStatus": "success", "isValid": true }, { new: true }).populate("userId").populate("eventId");
    if (orderData) {
      const dataToSend = {
        orderId: orderData._id,
        paymentStatus: orderData.paymentStatus,
        eventName: orderData.eventId.eventTitle,
        userName: orderData.userId.name,
        userEmail: orderData.userId.email,
        userPhone: orderData.userId.phone,
      }
      const dataForSuccessfulBooking={

      };
      await emailController.sendEmailToSelfOnSuccessOfOrderExecution(dataToSend);
      // await emailController.sendEmailToUserForSuccessfulBooking();
    }
    return true;
  }
  catch (err) {
    return false;
  }
}

exports.deleteCustomOrder = async (req,res)=>{

  try{
    
    if(!req.params.orderId)
      return res.json({statusCode:-1,message:"Please provide valid order id"});

    const deletedOrdered = await Order.findByIdAndDelete({_id:req.params.orderId});

    if(deletedOrdered){
      return res.json({statusCode:200,message:"Order deleted successfully!",data:deletedOrdered});
    }else{
      return res.json({statusCode:-1,message:"Error deleting order!"});
    }
  }catch(error){  
    console.log(error);
    return res.json({statusCode:-1,message:"Error deleting order!"});
  }

}
updateOrderStatusForFailed = async (mId) => {
  try {

    await Order.findByIdAndUpdate(mId, { "paymentStatus": "failed", "isValid": false });
    return true;

  }
  catch (err) {
    return false;
  }
}
exports.freeEventQrGeneration = async (req, res) => {
  if (await updateOrderStatusForSuccess(req.body.merchantTransactionId)) {
    const qrCodeGenerated = await this.createQRCode(req.body.merchantTransactionId);
    if (qrCodeGenerated)
      res.json({ statusCode: 200, message: "Qr code generated" })
    else
      res.json({ statusCode: -1, message: "error while generating Qr code" })
  }
}

exports.updateUserId = async (req, res) => {
  try {
    let result = await Order.findByIdAndUpdate(req.body.orderId, { "userId": req.body.userId });
    res.json({ statusCode: 200, message: "Order Updated", data: result })
  }
  catch (err) {
    res.json({ statusCode: -1, message: "Error!", data: null });
  }
}

//sending url to open for phonepe
const createPhonePeUrl = (queryParams) => {

  // Create a query string from the queryParams object
  const queryString = Object.keys(queryParams)
    .map(key => `${key}=${encodeURIComponent(queryParams[key])}`)
    .join('&');

  // Append the query string to the external LOCAL URL
  const urlWithParams = PhonePeConfig.phonpeUrlLocal + '?' + queryString;

  // Append the query string to the external LIVE URL
  //const urlWithParams = PhonePeConfig.phonpeUrlLive + '?' + queryString;

  return urlWithParams;
}

exports.getAllOfflineOrders = async (req, res) => {

  try {
    let orders = await Order.find({ isOfflineOrder: true }).populate("eventId").populate("userId");
    if (orders) {
      return res.json({ statusCode: 200, message: "orders fetched successfully!", data: orders });
    } else {
      return res.json({ statusCode: -1, message: "error fecthing offline orders!" });
    }
  } catch (error) {
    return res.json({ statusCode: -1, message: error });
  }
}
exports.placeCustomOrder = async (req, res) => {

  const orderData = req.body;
  let isSeasonRegularCombinedOrder = false;

  //validating tickets
  let totalPriceOfNormalOrder = 0;
  for (let ticket of orderData.tickets) {

    if (mongoose.isValidObjectId(ticket._id)) {
      const currentTicket = await ticketTypeSchema.findById(ticket._id);

      ticket.allowedPerson = currentTicket.allowedPerson;
      const ticketsAvailableToBook = currentTicket.totalAvailableTickets - currentTicket.ticketsSold

      if (ticket.quantity <= ticketsAvailableToBook && ticket.quantity <= 10) {

        if (currentTicket.ticketPrice == ticket.ticketPrice) {
          ticket.ticketPrice = currentTicket.ticketPrice
          totalPriceOfNormalOrder += currentTicket.ticketPrice * ticket.quantity;
        } else {
          //check for promocode as of now sending below message as tciket price is not same
          return res.json({ statusCode: -1, message: "Something went wrong,please try again later!" });
        }
      } else {

        return res.json({ statusCode: -1, message: "Please select valid tickets quantity! or all tickets might be sold out!" });
      }
    } else {
      return res.json({ statusCode: -1, message: "invalid ticket details,please try again later!" });
    }
  }

  //checking for type of order
  const regularTickets = orderData.tickets.filter(ticket => !ticket.isSeasonPass);
  const seasonPassTickets = orderData.tickets.filter(ticket => ticket.isSeasonPass);

  if (regularTickets.length == 0 && seasonPassTickets.length > 0) {
    orderData.seasonPassOrder = true;
  }
  else if (regularTickets.length > 0 && seasonPassTickets.length > 0) {
    isSeasonRegularCombinedOrder = true;
  } else {
    orderData.seasonPassOrder = false;
  }

  if (!isSeasonRegularCombinedOrder) {

    const ticketsUp = orderData.tickets.filter((ticket) => ticket.quantity > 0).map((ticket) => ({ ticket: ticket, quantity: ticket.quantity }));

    let newOrder;
    let queryParams;

    try {
      newOrder = new Order({
        eventId: orderData.eventId,
        userId: orderData.userId,
        tickets: ticketsUp,
        seasonPassOrder: orderData.seasonPassOrder,
        totalPrice: totalPriceOfNormalOrder,
        ticketDate: orderData.ticketDate,
        paymentStatus: "success",
        isValid: true,
        isOfflineOrder: true
      });

      let result = await newOrder.save();

      if (result) {
        if (await generateQrForCustomOrder(result._id?.toString())) {
          const order = await Order.findById(result._id).populate("eventId").populate("userId");
          return res.json({ statusCode: 200, message: "order placed successfully!", data: order });
        }
        else
          return res.json({ statusCode: -1, message: "error placing order" });

      } else {
        return res.json({ statusCode: -1, message: "Something went wrong,please try again later!", data: null });
      }
    } catch (error) {
      console.log(error);
      return res.json({ statusCode: -1, message: error, data: null });
    }


  } else {
    return res.json({ statusCode: -1, message: "you can only place either normal order or season order.both cannot be placed at same time" });
  }
}

const generateQrForCustomOrder = async (merchantTransactionId) => {

  if (await updateOrderStatusForSuccess(merchantTransactionId)) {

    const qrCodeGenerated = await this.createQRCode(merchantTransactionId);
    if (qrCodeGenerated)
      return true;
    else
      return false;

  }
  return false;
}

exports.initilizeOrder = async (req, res) => {


  let orderData = req.body;
  let isSeasonRegularCombinedOrder = false;


  if (mongoose.isValidObjectId(orderData.eventId)) {

    //checking valid tickets
    let totalPriceOfNormalOrder = 0;

    if (orderData.tickets) {

      //validating tickets
      for (let ticket of orderData.tickets) {

        if (mongoose.isValidObjectId(ticket._id)) {
          const currentTicket = await ticketTypeSchema.findById(ticket._id);

          ticket.allowedPerson = currentTicket.allowedPerson;
          const ticketsAvailableToBook = currentTicket.totalAvailableTickets - currentTicket.ticketsSold

          if (ticket.quantity <= ticketsAvailableToBook && ticket.quantity <= 10) {

            if (currentTicket.ticketPrice == ticket.ticketPrice) {
              ticket.ticketPrice = currentTicket.ticketPrice
              totalPriceOfNormalOrder += currentTicket.ticketPrice * ticket.quantity;
            } else {
              //check for promocode as of now sending below message as tciket price is not same
              return res.json({ statusCode: -1, message: "Something went wrong,please try again later!" });
            }
          } else {

            return res.json({ statusCode: -1, message: "Please select valid tickets quantity!" });
          }
        } else {
          return res.json({ statusCode: -1, message: "invalid ticket details,please try again later!" });
        }
      }

      //checking for type of order
      const regularTickets = orderData.tickets.filter(ticket => !ticket.isSeasonPass);
      const seasonPassTickets = orderData.tickets.filter(ticket => ticket.isSeasonPass);

      if (regularTickets.length == 0 && seasonPassTickets.length > 0) {
        orderData.seasonPassOrder = true;
      }
      else if (regularTickets.length > 0 && seasonPassTickets.length > 0) {
        isSeasonRegularCombinedOrder = true;
      } else {
        orderData.seasonPassOrder = false;
      }

      //for normal order
      if (!isSeasonRegularCombinedOrder) {

        const ticketsUp = orderData.tickets.filter((ticket) => ticket.quantity > 0).map((ticket) => ({ ticket: ticket, quantity: ticket.quantity }));

        let newOrder;
        let queryParams;

        //if order value is ZERO(0)/FREE
        if (totalPriceOfNormalOrder == 0) {

          try {
            newOrder = new Order({
              eventId: orderData.eventId,
              userId: orderData.userId,
              tickets: ticketsUp,
              seasonPassOrder: orderData.seasonPassOrder,
              totalPrice: totalPriceOfNormalOrder,
              ticketDate: orderData.ticketDate,
              paymentStatus: "success",
              isValid: true
            });

            let result = await newOrder.save();

            if (result) {
              return res.json({ statusCode: 200, message: "Order Initilize", data: result })
            } else {
              return res.json({ statusCode: -1, message: "Something went wrong,please try again later!", data: null });
            }

          } catch (error) {
            console.log(error)
            return res.json({ statusCode: -1, message: error, data: null });

          }
        }//if ticket price is NOT zero(0)/free
        else {

          try {
            newOrder = new Order({
              eventId: orderData.eventId,
              userId: orderData.userId,
              tickets: ticketsUp,
              seasonPassOrder: orderData.seasonPassOrder,
              totalPrice: totalPriceOfNormalOrder,
              ticketDate: orderData.ticketDate,
              paymentStatus: "pending",
              isValid: false
            });

            let result = await newOrder.save();

            if (result) {

              //queryparams for phonepe
              queryParams = {
                merchantTransactionId: result._id,
                amount: totalPriceOfNormalOrder,
                merchantUserId: 'MerchantUID'
              };

              //createing paramswithurl for phonepe
              const phonepeUrlWithParams = createPhonePeUrl(queryParams);

              return res.json({ statusCode: 200, message: "Order Initilize", data: phonepeUrlWithParams });
            } else {
              return res.json({ statusCode: -1, message: "Something went wrong,please try again later!", data: null });
            }
          } catch (error) {
            console.log(error);
            return res.json({ statusCode: -1, message: error, data: null });
          }
        }
        //for combined order
      } else if (isSeasonRegularCombinedOrder) {

        let regularOrderTotalPrice = 0;
        let seasonOrderTotalPrice = 0;

        for (let ticket of regularTickets) {
          regularOrderTotalPrice += ticket.ticketPrice * ticket.quantity;
        }

        for (let ticket of seasonPassTickets) {
          seasonOrderTotalPrice += ticket.ticketPrice * ticket.quantity;
        }


        const ticketsUpRegularOrder = regularTickets.filter((ticket) => ticket.quantity > 0).map((ticket) => ({ ticket: ticket, quantity: ticket.quantity }));
        const ticketsUpSeasonOrder = seasonPassTickets.filter((ticket) => ticket.quantity > 0).map((ticket) => ({ ticket: ticket, quantity: ticket.quantity }));

        try {
          const regularOrder = new Order({
            eventId: orderData.eventId,
            userId: orderData.userId,
            tickets: ticketsUpRegularOrder,
            seasonPassOrder: false,
            totalPrice: regularOrderTotalPrice,
            ticketDate: orderData.ticketDate,
            paymentStatus: "pending",
            isValid: false
          });

          const regularOrderResult = await regularOrder.save();

          if (regularOrderResult) {

            const seasonOrder = new Order({
              eventId: orderData.eventId,
              userId: orderData.userId,
              regularOrderId: regularOrderResult._id,
              tickets: ticketsUpSeasonOrder,
              seasonPassOrder: true,
              totalPrice: seasonOrderTotalPrice,
              ticketDate: orderData.ticketDate,
              paymentStatus: "pending",
              isValid: false
            });

            let seasonOrderResult = await seasonOrder.save();

            if (seasonOrderResult) {

              //queryparams for phonepe
              queryParams = {
                merchantTransactionId: seasonOrderResult._id,
                amount: regularOrderTotalPrice + seasonOrderTotalPrice,
                merchantUserId: 'MerchantUID'
              };

              //creating paramswithurl for phonepe
              const phonepeUrlWithParams = createPhonePeUrl(queryParams);
              return res.json({ statusCode: 200, message: "Order Initilize", data: phonepeUrlWithParams })
            } else {
              res.json({ statusCode: -1, message: "Something went wrong,please try again later!", data: null });
            }
          } else {
            res.json({ statusCode: -1, message: "Something went wrong,please try again later!", data: null });
          }
        } catch (error) {
          console.log(error);
          res.json({ statusCode: -1, message: error, data: null });
        }

      }
    } else {
      return res.json({ statusCode: -1, message: "invalid ticket details,please try again later!" });
    }

  } else {
    return res.json({ statusCode: -1, message: "invalid event details,please try again later!" });
  }
}

exports.createQRCode = async (orderId) => {

  try {
    const options = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
      scale: 4,
    };

    // Generate the QR code as a data URL (base64-encoded image)
    const qrCodeDataURL = await qrcode.toDataURL(orderId, options);


    // Remove the data URL prefix to get the base64-encoded image data
    const base64Image = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');

    // Create the folder if it doesn't exist
    if (!fs.existsSync("../uploads/qr-code")) {
      fs.mkdirSync("../uploads/qr-code", { recursive: true });
    }

    // Generate a unique filename for the QR code image
    const filename = `qr-code-${orderId}.png`;

    // Combine the folder path and filename
    const filePath = path.join("../uploads/qr-code", filename);

    // Save the base64-encoded image data as a PNG file
    fs.writeFileSync(filePath, base64Image, 'base64');

    console.log(`QR code saved to: ${filePath}`);
    let order = await Order.findByIdAndUpdate({ _id: orderId },
      { $set: { ticketQrCode: filePath } }, // Use $set to specify the field to be updated
      { new: true });
    return true;
  } catch (error) {
    console.error('Error generating and saving QR code:', error);
    return false;
  }
}
exports.getQrCode = (req, res) => {

  const qrCodeFilePath = path.join(__dirname, `../../uploads/qr-code/qr-code-${req.body.orderId}.png`);

  // Set the appropriate headers for the image response
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'inline; filename="qr-code.png"');

  // Send the QR code image as the response
  res.sendFile(qrCodeFilePath);
}
exports.getOrderByid = async (req, res) => {
  try {
    let result = await Order.findById({ _id: req.params.id });

    if (result) {
      res.json({ statusCode: 200, message: "Order fetched!", data: result });
    } else {
      res.json({ statusCode: -1, message: "error fetching Order", data: null });
    }
  } catch (e) {

    res.json({ statusCode: -1, message: "error fetching Order", data: null });

  }
}



exports.getOrderByEventid = async (req, res) => {
  try {

    let result = await Order.find({
      eventId: req.params.id,
      $or: [
        { isOfflineOrder: { $exists: false } }, // isOfflineOrder is not present
        { isOfflineOrder: false } // isOfflineOrder is false
      ]
    }).populate("userId");

    if (result) {

      res.json({ statusCode: 200, message: "Order fetched for event!", data: result });
    } else {
      res.json({ statusCode: -1, message: "error fetching Order", data: null });
    }
  } catch (e) {
    console.log(e);
    res.json({ statusCode: -1, message: "error fetching Order", data: null });
  }
}

exports.getOrderByUserid = async (req, res) => {
  try {
    let result = await Order.find({
      userId: req.params.id, 'isValid': true,
      'paymentStatus': "success"
    }).populate('eventId').lean().exec();//lean is used to convert mongodb document to plain js object
    for (let res of result) {
      res._id = res._id.toString().slice(-7);
    }

    //making two seperate list and now will sortthem data wise
    const liveEventsOrderDataSorted = result.filter((data) => data.eventId?.eventStatus == 'live').sort((a, b) => new Date(a?.ticketDate) - new Date(b?.ticketDate));
    const approvedEventsOrderDataSorted = result.filter((data) => data.eventId?.eventStatus == 'approved').sort((a, b) => new Date(a?.ticketDate) - new Date(b?.ticketDate));

    dataToSend = liveEventsOrderDataSorted.concat(approvedEventsOrderDataSorted);

    if (dataToSend) {
      res.json({ statusCode: 200, message: "Order fetched for user!", data: dataToSend });
    } else {
      res.json({ statusCode: -1, message: "error fetching Order", data: null });
    }
  } catch (e) {
    console.log(e);
    res.json({ statusCode: -1, message: "error fetching Order", data: null });
  }
}

exports.getPreviousOrderByUserid = async (req, res) => {
  try {
    let result = await Order.find({
      userId: req.params.id, 'isValid': false,
      'paymentStatus': "success"
    }).populate('eventId').lean().exec();//lean is used to convert mongodb document to plain js object
    for (let res of result) {
      res._id = res._id.toString().slice(-7);
    }
    //making two seperate list and now will sortthem data wise
    const liveEventsOrderDataSorted = result.filter((data) => data.eventId?.eventStatus == 'live').sort((a, b) => new Date(a?.ticketDate) - new Date(b?.ticketDate));
    const approvedEventsOrderDataSorted = result.filter((data) => data.eventId?.eventStatus == 'approved').sort((a, b) => new Date(a?.ticketDate) - new Date(b?.ticketDate));

    dataToSend = liveEventsOrderDataSorted.concat(approvedEventsOrderDataSorted);

    if (dataToSend) {
      res.json({ statusCode: 200, message: "Order fetched for user!", data: dataToSend });
    } else {
      res.json({ statusCode: -1, message: "error fetching Order", data: null });
    }
  } catch (e) {
    console.log(e);
    res.json({ statusCode: -1, message: "error fetching Order", data: null });
  }
}
//scanning of ticket logic for entry
exports.scanQrCodeForEntry = async (req, res) => {
  const eventId = req.body.eventId;
  const orderId = req.body.orderId;
  const orderData = await Order.findOne({ _id: orderId }).populate('tickets.ticket');
  if (orderData.eventId == eventId) {

    if (orderData.paymentStatus == 'success' && orderData.isValid == true) {

      //for  season pass
      if (orderData.seasonPassOrder) {

        const eventData = await eventModel.findOne({ _id: eventId });
        const eventStartDate = eventData?.eventDates[0]?.eventDate;
        const eventEndDate = eventData?.eventDates[eventData?.eventDates?.length - 1]?.eventDate;
        const eventStartDateIst = moment(eventStartDate).tz('Asia/Kolkata').startOf('day');
        const eventEndDateIst = moment(eventEndDate).tz('Asia/Kolkata').startOf('day');

        const currentDateIst = moment().tz('Asia/Kolkata').startOf('day');
        let ticketDateIst = moment(orderData.ticketDate).tz('Asia/Kolkata').startOf('day');

        if (currentDateIst.isSameOrAfter(eventStartDateIst) && currentDateIst.isSameOrBefore(eventEndDateIst)) {

          if (ticketDateIst.isSameOrBefore(currentDateIst)) {

            let indexForNextDate = 0;
            for (let i = 0; i < eventData.eventDates.length; i++) {
              if (moment(eventData?.eventDates[i]?.eventDate).tz('Asia/Kolkata').startOf('day').isSame(moment(orderData.ticketDate).tz('Asia/Kolkata').startOf('day'))) {

                indexForNextDate = i + 1;
                break;
              }
            }

            if (indexForNextDate <= eventData.eventDates.length - 1) {
              orderData.ticketDate = moment(eventData?.eventDates[indexForNextDate]?.eventDate).tz('Asia/Kolkata').startOf('day');
              ticketDateIst = moment(eventData?.eventDates[indexForNextDate]?.eventDate).tz('Asia/Kolkata').startOf('day');
            }
            else
              orderData.isValid = false;

            let Validity = false;
            if (ticketDateIst.isSameOrBefore(eventEndDateIst)) {
              Validity = true;

            }
            else {
              Validity = false;

            }
            //getting number of people catagory wise
            let result = [];

            for (let ticket of orderData.tickets) {
              let ticketTitle = ticket.ticket.ticketTitle;
              let numberOfPeople = ticket.quantity * ticket.ticket.allowedPerson;
              const obj = {
                ticketTitle: ticketTitle,
                numberOfPeople: numberOfPeople
              }
              result.push(obj);
            }

            await orderData.save();

            return res.json({ statusCode: 200, message: "access granted", data: { isValid: Validity, allowedPeople: result } });

          } else {

            return res.json({ statusCode: -1, message: "event yet to come,cannot have access!" });

          }
        } else {

          return res.json({ statusCode: -1, message: "access not allowed,check event dates!" });

        }

      } else {

        //for non season pass
        const currentDateIst = moment().tz('Asia/Kolkata');
        const ticketDateIst = moment(orderData.ticketDate).tz('Asia/Kolkata');
        currentDateIst.startOf('day');
        ticketDateIst.startOf('day');

        if (currentDateIst.isSame(ticketDateIst)) {

          orderData.isValid = false;

          //getting number of people catagory wise
          let result = [];

          for (let ticket of orderData.tickets) {
            let ticketTitle = ticket.ticket.ticketTitle;
            let numberOfPeople = ticket.quantity * ticket.ticket.allowedPerson;
            const obj = {
              ticketTitle: ticketTitle,
              numberOfPeople: numberOfPeople
            }
            result.push(obj);
          }

          await orderData.save();

          return res.json({ statusCode: 200, message: "access granted", data: { isValid: true, allowedPeople: result } });

        } else if (currentDateIst.isBefore(ticketDateIst)) {

          return res.json({ statusCode: -1, message: "event yet to come!" });

        } else if (currentDateIst.isAfter(ticketDateIst)) {

          orderData.isValid = false;

          await orderData.save();

          return res.json({ statusCode: -1, message: "event is completed,cannot have access to this event!" });

        }

      }

    } else {
      return res.json({ statusCode: -1, message: "invalid qr code!" });

    }

  } else {

    return res.json({ statusCode: -1, message: "another event qr code scanned" });

  }
}

exports.createEPass = async (req, res) => {
  const qrCodeData = `number:${req.body.number},
    number:${req.body.numberOfTicket},
    amount:${req.body.amount}
    `; // Replace with the actual data for the QR code
  const qrCodeImagePath = path.join(__dirname, `../../uploads/qr-code/${req.body.number}-qrcode.png`);

  // Generate the QR code
  await qrcode.toFile(qrCodeImagePath, qrCodeData);

  const ticketContent = `
    <!DOCTYPE html>
    <html>
    <head>
    <title>E-Pass QR Code</title>
  
    <style>
    *{
        margin:0;
        padding:0;
        box-sizing:border-box;
        font-family: 'Pathway Extreme', sans-serif;
        user-select:none;
        transition:all .1s;
      }
      
      body{
        display:flex;
        justify-content:center;
        align-items:center;
        min-height:100vh;
        background:#ccc;
        overflow:hidden;
      }
      
      .m-ticket{
        width:350px;
        background:#fff;
        border-radius:12px;
        overflow:hidden;
        box-shadow:0 0 25px #bbb;
        display:flex;
        flex-direction:column;
        align-items:center;
        position:relative;
        cursor:move;
      }
      
      
      .m-ticket:before{
        content:"";
        position:absolute;
        left:-10px;
        top:41%;
        background:#eee;
        box-shadow:inset 0 0 25px #bbb;
        width:17px;
        height:17px;
        border-radius:50%;
      }
      
      
      .m-ticket:after{
        content:"";
        position:absolute;
        right:-10px;
        top:41%;
        background:#eee;
        box-shadow:inset 0 0 25px #bbb;
        width:17px;
        height:17px;
        border-radius:50%;
      }
      
      
      .m{
        position:absolute;
        right:-5px;
        top:15%;
        transform:rotate(270.5deg);
        font-size:.80em;
        color:#888;
      }
      
      
      .m-ticket > .movie-details{
        display:flex;
        gap:20px;
        padding:20px 20px;
      }
      
      .m-ticket > .movie-details > .poster{
        width:100%;
        height:120px;
        object-fit:contain;
        border-radius:8px;
        box-shadow:0 0 10px #888;
      }
      .m-ticket > .movie-details > .movie > h4{
        text-transfrom:capitalize;
        font-size:1.6em;
        margin-bottom:20px;
        width:200px;
      }
      .m-ticket > .movie-details > .movie > p{
        font-size:.80em;
        line-height:19px;
        color:#777;
      }
      .m-ticket > .info{
        width:93%;
        border-radius:20px;
        background:#eee;
        padding:10px 0px;
        text-align:center;
        font-size:.72em;
      }
      .m-ticket > .ticket-details{
        display:flex;
        gap:20px;
        padding:20px 20px;
      }
      
      
      .m-ticket > .ticket-details > .scan{
        width:100px;
        height:100px;
      }
      
      .m-ticket > .ticket-details > .ticket{
        text-align:center;
        width:200px;
        margin-top:15px;
      }
      
      
      .m-ticket > .ticket-details > .ticket > p{
        font-size:.80em;
        line-height:19px;
        color:#777;
      }
      
      .m-ticket > .ticket-details > .ticket > b{
        margin-top:10px;
        display:inline-block;
        font-size:1.2em;
        font-weight:400;
      }
      
      
      .m-ticket > .ticket-details > .ticket > h6{
        text-transform:uppercase;
        font-weight:100;
        font-size:.95em;
        margin-top:10px;
      }
      
      
      .m-ticket > .info-cancel{
        width:100%;
        background:#eee;
        color:#888;
        padding:10px 0px;
        text-align:center;
        font-size:.80em;
      }
      
      
      .m-ticket > .total-amount{
        display:flex;
        justify-content:space-between;
        padding:12px 20px;
        font-weight:700;
        font-size:.90em;
        width:100%;
      }
      .m-ticket > .svg-container {
        background-color: #362B78; /* Set your desired background color here */
      }
    </style>
    </head>
      <body>
      <div class="m-ticket" id="root"> 
      <div class="movie-details">
        <img  src="http://localhost:3000/uploads/event-images/afterlife (2).jpg" class="poster">
        
        <div class="movie">
          <h4 style="padding-right: 10px;">Afterlife Techno 2.0</h4>
          <p>Hosted by: Ftv Cafe And Zed’S Creation</p>
          
          
        </div>
        
      </div>
      
      <div class="info">
        Tap for support, details & more actions
      </div>
      <br>
      <div class="ticket-details">
        <img src="http://localhost:3000/uploads/qr-code/${req.body.number}-qrcode.png" class="scan">
        <div class="ticket">
        <p>${req.body.numberOfTicket} Ticket(s)</p>
        <p>Sat, 5 Aug | 11:00 PM</p>
        <p>FTV Café & Restro</p>
        </div>
        
      </div>
      
      <div class="info-cancel">
       Ticketing Partner <b style="color:#362B78">Showmates.in</b>
      </div>
      
      <div class="total-amount">
        <p>Total Amount</p>
        
        <p>Rs. ${req.body.amount}</p>
      </div>
      
    </div>
      </body>
    </html>
    `;
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1000, height: 800 });
    // Set the content of the page with the HTML
    await page.setContent(ticketContent);

    // Wait for any asynchronous content to load (optional)
    await page.waitForTimeout(2000);

    const rootDivHandle = await page.$('#root');

    if (rootDivHandle) {
      await rootDivHandle.screenshot({ path: `../uploads/epass/${req.body.number}-ticket.png`, type: 'png' });
    } else {
      throw new Error("Element with selector '#root' not found on the page.");
    }
    await browser.close();
    console.log(`Image generated successfully at ./output.png`);
  } catch (error) {
    console.error('Error generating image:', error);
  }
}
