const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
const catagoriesRoutes = require('./routes/catagory');
const eventRoutes = require('./routes/event');
const authRoutes = require('./routes/auth');
const bannerRoutes = require('./routes/banner');
const listYourEventsRoutes = require('./routes/list-your-event');
const emailRoutes = require('./routes/email');
const orderRoutes = require('./routes/order');
const blogRoutes = require('./routes/blog');
const ticketTypeRoutes = require('./routes/ticketType');
const promocodeRoutes = require('./routes/promocode');
const https = require('https');
const compression = require('compression');
const http = require('http');
const fs = require('fs');
const moment = require('moment-timezone');
const httpProxy = require('express-http-proxy');
const userModel= require('./models/userSchema');
const cron = require('node-cron');
const localDbConnectionUrl = "mongodb://0.0.0.0:27017/showmates";
const remoteDbConnectionUrl = "mongodb://rootMe:admin-pass072@localhost:27017/showmates?directConnection=true&appName=mongosh+1.10.0";
//for cross server data transfer
const cors = require('cors');

const eventModel = require('./models/eventSchema');
const orderModel = require('./models/orderSchema');
const emailController = require('./controllers/emailController');

const options = {
  key: fs.readFileSync('certificates/key.pem'),
  cert: fs.readFileSync('certificates/cert.pem')
}

//creating instace for express
app = express();

//connecting with mongodb
mongoose
  .connect(localDbConnectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("db connected");
     
  }).catch((err) => {
    console.log("error", err);
  });



//Define a cron job that runs every minute
cron.schedule('* * * * *', async () => {
  try {
    //---------------------------------------CRON JOB FOR EVENT START----------------------------------------------
    const currentDateIST = moment().tz('Asia/Kolkata');

    // Find events that are not expired and have event start date less than or equal to current date
    const eventsToUpdate = await eventModel.find({
      eventStatus: { $ne: 'expired' },
    });

    // Update event statuses based on conditions
    for (const event of eventsToUpdate) {
      let shouldUpdateStatusToLive = false;
      let shouldUpdateStatusToApproved = false;


      for (const dateInfo of event.eventDates) {

        const formattedDate = moment(dateInfo.eventDate).tz('Asia/Kolkata').format('YYYY-MM-DD');

        // Combine event date and end time to create a datetime string
        const eventEndDateTime = moment.tz(`${formattedDate} ${dateInfo.eventEndTime}`, 'YYYY-MM-DD HH:mm:ss A', 'Asia/Kolkata');
        // Extract the start and end times

        const eventStartTime = moment(dateInfo.eventStartTime, 'h:mm a');
        let eventEndTime = moment(dateInfo.eventEndTime, 'h:mm a');

        // Handle cases where event spans from PM to AM
        if (formattedDate == currentDateIST.format('YYYY-MM-DD') && eventEndTime.isBefore(eventStartTime)) {

          eventEndTime = eventEndTime.add(1, 'day'); // Add 24 hours
          if (currentDateIST.isSameOrBefore(eventEndTime)) {
            shouldUpdateStatusToLive = true;
            break;
          } else {
            shouldUpdateStatusToApproved = true;
            break;
          }
        } else {//for normal cases
          //making event live based on date
          if (formattedDate == currentDateIST.format('YYYY-MM-DD') && currentDateIST.isSameOrBefore(eventEndDateTime)) {
            //Event is live for this date and time
            shouldUpdateStatusToLive = true;
            break;
          }
          else if (formattedDate == currentDateIST.format('YYYY-MM-DD') && currentDateIST.isAfter(eventEndDateTime)) {
            // Event is live for this date (no specific start and end time)
            shouldUpdateStatusToApproved = true;
            break;
          }
        }
      }

      if (shouldUpdateStatusToLive) {
        event.eventStatus = 'live';
      }
      else if (shouldUpdateStatusToApproved) {
        event.eventStatus = 'approved';
      } else {
        if (event.eventStatus == 'not-approved')
          event.eventStatus = 'not-approved';
        else
          event.eventStatus = 'approved';
      }

      await event.save();
    }

    // Set expired status for events that have ended
    for (const event of eventsToUpdate) {

      if (event.eventDates.length > 0) {
        const lastDateInfo = event.eventDates[event.eventDates.length - 1]; // Get the last date info
        const requiredFormattedDate = moment(lastDateInfo.eventDate).tz('Asia/Kolkata').format('YYYY-MM-DD');

        if (lastDateInfo.eventStartTime != "" && lastDateInfo.eventEndTime != "") {

          const eventStartTime = moment(lastDateInfo.eventStartTime, 'h:mm a');
          let eventEndTime = moment.tz(`${requiredFormattedDate} ${lastDateInfo.eventEndTime}`, 'YYYY-MM-DD h:mm a', 'Asia/Kolkata');
          //handling pm to am 
          if (requiredFormattedDate == currentDateIST.format('YYYY-MM-DD') && eventEndTime.isBefore(eventStartTime)) {
  
            eventEndTime = eventEndTime.add(1, 'day'); // Add 24 hours
          }
            if (currentDateIST.isAfter(eventEndTime)) {
              event.eventStatus = 'expired';
              await event.save();
            }
          } else if (currentDateIST.isSameOrAfter(moment.tz(requiredFormattedDate, 'YYYY-MM-DD', 'Asia/Kolkata'))) {
            event.eventStatus = 'expired';
            await event.save();
          }
        }
      }
      //------------------------------------------------------CRON JOB FOR EVENT END-----------------------------------------------
      console.log('Event statuses updated successfully');
    
  } catch (error) {
    console.error('Error updating event statuses:', error);
  }
});


//-------------------------------------------CRON JOB FOR ORDER START---------------------------------------------------------

// Define a cron job that runs every minute
// 0 18 * * *
cron.schedule('0 18 * * *', async () => {

  //getting all orders

  let orders = await orderModel.find({ paymentStatus: "pending" });

  const currentDateIST = moment().tz('Asia/Kolkata');

  for (let order of orders) {

    const differenceInHours = currentDateIST.diff(order.bookingDate, 'hours');

    if (differenceInHours > 3) {
      order.deleteOne({ bookingDate: order.bookingDate });
    }
  }

  await orders.save();

});
//----------------------------------------------CRON JOB FOR ORDER END-------------------------------------------

//middleware for data input
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//middleware for cross origin data access
app.use(cors());


// Enable gzip compression for textual data
//compresses file/data larger than  1024 bytes(1KB) 
app.use(compression());

//activating routes(connecting to node with entry node module(app.js))
app.use("/api", userRoutes);
app.use("/catagory", catagoriesRoutes);
app.use("/events", eventRoutes);
//for accessing uploads folder in angular
app.use("/uploads", express.static('../uploads', {
  maxAge: '1d', // Set the caching duration
}));
app.use("/assets", express.static('./assets/images/'));


//for login and signup
app.use("/authenticate", authRoutes);
app.use("/banner", bannerRoutes);
app.use("/order", orderRoutes, httpProxy('https://mercury-uat.phonepe.com'));
app.use("/list-your-event", listYourEventsRoutes);
app.use("/email", emailRoutes);
app.use("/ticket", ticketTypeRoutes);
app.use("/promocode", promocodeRoutes);
app.use("/blog", blogRoutes);

//calling email method 
// app.post('/some-route', async (req, res) => {
//   try {
//     // Your code here

//     const email = [
//       'meetbhavsar14@gmail.com',
//       'kikytales7@gmail.com',
//       'kinjal@biztechcs.com',
//       'solankihina812@gmail.com',
//       'hina@ninjatech.agency',
//       'solankihina812@gmail.com',
//       'payalboda555@gmail.com',
//       'vrushti@inexture.com',
//       'pithava.dipali@gmail.com',
//       'hr@rapidops.com',
//       'parth.shah@tatvasoft.com'
//     ];
//     req.body.email = email;

//     // Call the sendEmailForGarba method
//     await emailController.sendEmailForGarba(req, res);

//     console.log("send mail");
//     // Rest of your code
//   } catch (error) {
//     // Handle any errors here
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// live server connection
// https.createServer(options, app).listen(3000, () => {
//   console.log("server started");
// });



//to connect locally
http.createServer(options, app).listen(3000, () => {
  console.log("server started");
});

