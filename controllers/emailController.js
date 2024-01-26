const emailUtil = require('../utils/emailUtils');
const path = require('path');
const qrCode = require('qrcode');
const nodemailer = require('nodemailer');
const encryptionUtils = require('../utils/encryptionUtils');


const isEmail = (value) => {
  // Define a regular expression pattern for a valid email address
  var pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

  // Use the test() method to check if the email matches the pattern
  var isEmailValid = pattern.test(value);

  // Check if the email matches the pattern and if the domain is one of the specified ones
  if (isEmailValid) {
    var domain = value.split('@')[1].toLowerCase();
    if (['gmail.com', 'yahoo.com', 'outlook.com'].includes(domain)) {
      return true;
    }
  }

  return false;
}

exports.sendWelcomeEmailForOrganizer = async (data) => {

  if (isEmail(data.email) == false) {
    return res.json({ statusCode: -1, message: "invalid email format,please try again with valid email!" });
  }
  const emailContent = `
    <!DOCTYPE html>
<html>
<head>
  <title>Welcome to Showmates</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 20px !important;
      }
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px;
      text-align: center;
      background-color: #f2f2f2;
    }
    
    .logo {
      max-width: 200px;
      height: auto;
      margin-bottom: 20px;
    }
    
    h1 {
      color: #333333;
      font-size: 24px;
      margin-bottom: 20px;
    }
    
    p {
      color: #555555;
      font-size: 16px;
      margin-bottom: 10px;
    }
    
    .message {
      color: #555555;
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    .message-center{
      text-align:center
    }
  </style>
</head>
<body>
  <div class="container">
    <img class="logo" src="https://showmates.in:3000/assets/logo.png" alt="Company Logo">
    <h1>Welcome to Showmates</h1>
    <p class="message">Dear ${data.email},</p>
    <p class="message">We are thrilled to have you join as organizer. On behalf of everyone at Showmates, I would like to extend a warm welcome to you.</p>
    <p class="message-center">Your Credentials(Use below credentials to login)</p>
    <p class="message">Email :- ${data.email}</p>
    <p class="message">Password :- ${data.password}</p>
    <p class="message">Link :- <a href="https://myshow.showmates.in/" >Showmates Organizer Login</a></p>

    <p class="message">If you have any questions or need any assistance, please don't hesitate to reach out to me or any member of our team. We are here to support you in every way possible.</p>   
    <p style="font-size:0.9em;">Regards,<br />Showmates and team</p>
    <!-- <p class="message">[Your Name]</p> -->
  </div>
</body>
</html>
    `;
  await emailUtil.sendEmail(
    data.email,
    "Showmates family welcomes you!",
    emailContent
  )

}
exports.sendWelcomeEmailForCustomer = async (req, res) => {
  if (isEmail(req.body.email) == false) {
    return res.json({ statusCode: -1, message: "invalid email format,please try again with valid email!" });
  }
  // HTML content of the email
  const emailContent = `
    <!DOCTYPE html>
<html>
<head>
  <title>Welcome to Our Company</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 20px !important;
      }
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px;
      text-align: center;
      background-color: #f2f2f2;
    }
    
    .logo {
      max-width: 200px;
      height: auto;
      margin-bottom: 20px;
    }
    
    h1 {
      color: #333333;
      font-size: 24px;
      margin-bottom: 20px;
    }
    
    p {
      color: #555555;
      font-size: 16px;
      margin-bottom: 10px;
    }
    
    .message {
      color: #555555;
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <img class="logo" src="https://showmates.in:3000/assets/logo.png" alt="Company Logo">
    <h1>Welcome to Showmates</h1>
    <p class="message">Dear ${req.body.email},</p>
    <p class="message">We are thrilled to have you join showmates. On behalf of everyone at Showmates, I would like to extend a warm welcome to you.</p>
    <p class="message">Enjoy and book your events along with your friends with showmates.</p>   
    <p style="font-size:0.9em;">Regards,<br />Showmates and team</p>
    <!-- <p class="message">[Your Name]</p> -->
  </div>
</body>
</html>
    `;
  await emailUtil.sendEmail(
    req.body.email,
    "Showmates family welcomes you!",
    emailContent
  )

}
exports.sendListYourEventMail = async (req, res) => {
  if (isEmail(req.body.yourEmail) == false) {
    return res.json({ statusCode: -1, message: "invalid email format,please try again with valid email!" });
  }
  // HTML content of the email
  const emailContent = `
    <!DOCTYPE html>
<html>
<head>
  <title>Event Request Sent Successfully</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 20px !important;
      }
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px;
      text-align: center;
      background-color: #f2f2f2;
    }
    
    .logo {
      max-width: 200px;
      height: auto;
      margin-bottom: 20px;
    }
    
    h1 {
      color: #333333;
      font-size: 24px;
      margin-bottom: 20px;
    }
    
    p {
      color: #555555;
      font-size: 16px;
      margin-bottom: 10px;
    }
    
    .message {
      color: #555555;
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    
    .button {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #4CAF50;
      color: #ffffff;
      font-size: 18px;
      text-align: center;
      text-decoration: none;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <img class="logo" src="https://showmates.in:3000/assets/logo.png" alt="Company Logo">
    <h1>Your Event Request has been Sent Successfully!</h1>
    <p class="message">Dear ${req.body.yourName},</p>
    <p class="message">Thank you for submitting your event request. We have received your request and it is currently being reviewed by our team. Please allow some time for our administrators to assess and you will be contacted soon for further information.</p>
    <p class="message">Your Details:</p>
    <p class="message">Name: ${req.body.yourName}</p>
    <p class="message">Email: ${req.body.yourEmail}</p>
    <p class="message">Contact Number: ${req.body.yourContactNumber}</p>
    <p class="message">Event Details:</p>
    <p class="message">Event Name: ${req.body.eventCatagory}</p>
    <p class="message">Event Date: ${req.body.numberOfPeople}</p>
    <p class="message">Once your request has been reviewed and approved, you will receive a confirmation email with further details and instructions. We appreciate your patience and cooperation.</p>
    <p class="message">If you have any urgent questions or need immediate assistance, please feel free to contact our support team at [Email-showmates759@gmail.com].</p>
    <p class="message">Thank you for choosing our services. We look forward to making your event a success!</p>
    <a class="button" href="https://showmates.in">Visit Our Website</a>
    <p style="font-size:0.9em;">Regards,<br />Showmates and team</p>
  </div>
</body>
</html>

    `;

  let email = ['showmates759@gmail.com'];
  email.push(req.body.yourEmail);
  await emailUtil.sendEmail(
    email,
    "Showmates-Event waiting for approval!",
    emailContent
  )

}
exports.sendEventAddedByOrganizer = async (req, res) => {
  // HTML content of the email
  if (isEmail(req.body.email) == false) {
    return res.json({ statusCode: -1, message: "invalid email format,please try again with valid email!" });
  }
  const emailContent = `
    <!DOCTYPE html>
<html>
<head>
  <title>Event Request Sent Successfully</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 20px !important;
      }
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px;
      text-align: center;
      background-color: #f2f2f2;
    }
    
    .logo {
      max-width: 200px;
      height: auto;
      margin-bottom: 20px;
    }
    
    h1 {
      color: #333333;
      font-size: 24px;
      margin-bottom: 20px;
    }
    
    p {
      color: #555555;
      font-size: 16px;
      margin-bottom: 10px;
    }
    
    .message {
      color: #555555;
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    
    .button {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #4CAF50;
      color: #ffffff;
      font-size: 18px;
      text-align: center;
      text-decoration: none;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <img class="logo" src="https://showmates.in:3000/assets/logo.png" alt="Company Logo">
    <h1>Your Event Request has been Sent Successfully!</h1>
    <p class="message">Dear ${req.body.name},</p>
    <p class="message">Thank you for submitting your event request. We have received your request and it is currently being reviewed by our team. Please allow some time for our administrators to assess and approve your event.</p>
    <p class="message">Event Details:</p>
    <p class="message">Event Name: ${req.body.eventName}</p>
    <p class="message">Event Date: ${req.body.eventDate}</p>
    <p class="message">Once your request has been reviewed and approved, you will receive a confirmation email with further details and instructions. We appreciate your patience and cooperation.</p>
    <p class="message">If you have any urgent questions or need immediate assistance, please feel free to contact our support team at [Email-showmates759@gmail.com,Phone-8128024338].</p>
    <p class="message">Thank you for choosing our services. We look forward to making your event a success!</p>
    <a class="button" href="https://showmates.in">Visit Our Website</a>
    <p style="font-size:0.9em;">Regards,<br />Showmates and team</p>
  </div>
</body>
</html>

    `;

  await emailUtil.sendEmail(
    [req.body.email, 'showmates759@gmail.com'],
    "Showmates-Event waiting for approval!",
    emailContent
  )

}


exports.sendEventApprovedByAdmin = async (req, res) => {
  if (isEmail(req.body.email) == false) {
    return res.json({ statusCode: -1, message: "invalid email format,please try again with valid email!" });
  }
  // HTML content of the email
  const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Event Approved</title>
      <style>
        @media only screen and (max-width: 600px) {
          .container {
            width: 100% !important;
            padding: 20px !important;
          }
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px;
          text-align: center;
          background-color: #f2f2f2;
        }
        
        .logo {
          max-width: 200px;
          height: auto;
          margin-bottom: 20px;
        }
        
        h1 {
          color: #333333;
          font-size: 24px;
          margin-bottom: 20px;
        }
        
        p {
          color: #555555;
          font-size: 16px;
          margin-bottom: 10px;
        }
        
        .message {
          color: #555555;
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 20px;
        }
        
        .button {
          display: inline-block;
          margin-top: 20px;
          padding: 10px 20px;
          background-color: #4CAF50;
          color: #ffffff;
          font-size: 18px;
          text-align: center;
          text-decoration: none;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img class="logo" src="https://showmates.in:3000/assets/logo.png" alt="Company Logo">
        <h1>Your Event has been Approved!</h1>
        <p class="message">Dear ${req.body.name},</p>
        <p class="message">We are pleased to inform you that your event request has been approved by our administrators. Congratulations!</p>
        <p class="message">Event Details:</p>
        <p class="message">Event Name: ${req.body.eventTitle}</p>
        <p class="message">Event Date: ${req.body.eventDate}</p>
        <!-- <p class="message">Event Time: [Event Time]</p>
        <p class="message">Location: [Event Location]</p> -->
        <p class="message">Please find the detailed information and any additional instructions in the attached document.</p>
        <p class="message">If you have any further questions or require assistance, please feel free to contact our support team at [Email-showmates759@gmail.com,Phone-8128024338].</p>
        <p class="message">We wish you every success in organizing your event and hope it turns out to be a remarkable experience for everyone involved.</p>
        <a class="button" href="https://showmates.in/event-details/${req.body.eventId}">View Event Details</a>
        <p style="font-size:0.9em;">Regards,<br />Showmates and team</p>
      </div>
    </body>
    </html>
    
    `;

  await emailUtil.sendEmail(
    [req.body.email, 'showmates759@gmail.com'],
    "Showmates-Event approved!",
    emailContent
  )

}
exports.bookRequest = async (req, res) => {

  // HTML content of the email
  const emailContent = `New Request has been added
    `;

  await emailUtil.sendEmail(
    "manishpurohit560@gmail.com",
    "Book Request",
    emailContent
  )

}

//mail for otp
exports.sendEmailForOtp = async (req, res) => {



  //check if the data is encrypted
  let data = null;
  if (await encryptionUtils.isDataEncrypted) {
    //decrypting the data
    data = encryptionUtils.decryptData(req.body.data);
  } else {
    data = req.body.data;
  }
  if (isEmail(data.email) == false) {
    return res.json({ statusCode: -1, message: "invalid email format,please try again with valid email!" });
  }

  // HTML content of the email
  const emailContent = `
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
	<div style="margin:50px auto;width:70%;padding:20px 0">
	  <div style="border-bottom:1px solid #eee">
		<a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Showmates</a>
	  </div>   
	  <p style="font-size:1.1em">Hi,</p>
	  <p>Thank you for choosing our service and starting your account creation process! We're excited to have you on board. 
	As a part of our security measures, we have generated a One-Time Password (OTP) to verify your account.</p>
	  <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${data.OTP}</h2>
	  <p style="font-size:0.9em;">Regards,<br />Showmates and team</p>
	  <hr style="border:none;border-top:1px solid #eee" />
	  <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
		<!-- <p>Your Brand Inc</p>
		<p>1600 Amphitheatre Parkway</p>
		<p>California</p> -->
		<p>Please note that this OTP is time-limited and will expire after a certain period. Enter the OTP accurately in the provided field during the account creation process to proceed further. If you didn't initiate this account creation request, please disregard this email and ensure the security of your account</p>
	  </div>
	</div>
  </div>
    `;

  let result = await emailUtil.sendEmail(
    data.email,
    "Showmates-Verify OTP",
    emailContent
  )
  if (result)
    return { statusCode: 200, message: "OTP sent successfully" };
  else
    return { statusCode: -1, message: "Error sending OTP" };

}




//mail for emailing marketing reagrding garba
exports.sendEmailForGarba = async (req, res) => {
  if (isEmail(req.body.email) == false) {
    return res.json({ statusCode: -1, message: "invalid email format,please try again with valid email!" });
  }

  // HTML content of the email
  const emailContent = `
 
  <!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <style>
          @media screen and (max-width: 600px) {
              table.col-600 {
                  width: 100% !important;
                  border-left: none !important;
                  border-right: none !important;
              }
  
              td {
                  text-align: center !important;
              }
  
              td>table {
                  width: 100% !important;
              }
  
              /* Add more responsive styles as needed */
          }
      </style>
  </head>
  
  <body>
      <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
  
          <!-- START HEADER/BANNER -->
  
          <tbody>
              <tr>
                  <td align="center">
                      <table class="col-600" width="600" border="0" align="center" cellpadding="0" cellspacing="0">
                          <tbody>
                              <tr>
                                  <td align="center" valign="top"
                                      background="https://img.freepik.com/free-photo/vivid-blurred-colorful-wallpaper-background_58702-2731.jpg?size=626&ext=jpg&ga=GA1.1.1368352105.1692290271&semt=ais"
                                      bgcolor="#66809b" style="background-size:cover; background-position:top;height="
                                      400""="">
                                      <table class="col-600" width="600" height="400" border="0" align="center"
                                          cellpadding="0" cellspacing="0">
  
                                          <tbody>
                                              <tr>
                                                  <td height="40"></td>
                                              </tr>
  
  
                                              <tr>
                                                  <td align="center" style="line-height: 0px;">
                                                      <img style=" line-height:0px; font-size:0px; border:0px;"
                                                          src="https://showmates.in:3000/assets/logo.png" width=""
                                                          height="" alt="logo">
                                                  </td>
                                              </tr>
  
  
  
                                              <tr>
                                                  <td align="center"
                                                      style="font-family: 'Raleway', sans-serif; font-size:37px; color:#ffffff; line-height:24px; font-weight: bold; letter-spacing: 7px;">
                                                      કામ તો રોજ, <span
                                                          style="font-family: 'Raleway', sans-serif; font-size:30px; color:#ffffff; line-height:45px; font-weight: 300; letter-spacing: 2px;">આજ
                                                          ગરબા ની મોજ</span>
                                                  </td>
                                              </tr>
  
  
  
  
  
                                              <tr>
                                                  <td align="center"
                                                      style="font-family: 'Lato', sans-serif; font-size:18px; color:#ffffff; line-height:24px; font-weight: 350;">
                                                      Unite Your Team for an Unforgettable Garba Nights
                                                  </td>
                                              </tr>
  
  
                                              <tr>
                                                  <td height="50"></td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </tbody>
                      </table>
                  </td>
              </tr>
  
  
              <!-- END HEADER/BANNER -->
  
  
              <!-- START 3 BOX SHOWCASE -->
  
              <tr>
                  <td align="center">
                      <table class="col-600" width="600" border="0" align="center" cellpadding="0" cellspacing="0"
                          style="margin-left:20px; margin-right:20px; border-left: 1px solid #dbd9d9; border-right: 1px solid #dbd9d9;">
                          <tbody>
                              <tr>
                                  <td height="35"></td>
                              </tr>
                              <tr>
                                  <td align="center"
                                      style="font-family: 'Raleway', sans-serif; font-size:22px; font-weight: bold; color:#2a3a4b;">
                                      CORPORATE GARBA - BULK PASSES</td>
                              </tr>
                              <tr>
                                  <td height="10"></td>
                              </tr>
                              <tr>
                                  <td align="center"
                                      style="font-family: 'Lato', sans-serif; font-size:14px; color:#757575; line-height:24px; font-weight: 300;">
                                      Attending a corporate Garba event can create lasting memories for employees.
                                  </td>
                              </tr>
                          </tbody>
                      </table>
                  </td>
              </tr>
  
  
              <tr>
                  <td align="center">
                      <table class="col-600" width="600" border="0" align="center" cellpadding="0" cellspacing="0"
                          style="border-left: 1px solid #dbd9d9; border-right: 1px solid #dbd9d9;">
                          <tbody>
                              <tr>
                                  <td height="10"></td>
                              </tr>
                              <tr>
                                  <td>
                                      <table class="col3" width="100%" border="0" align="center" cellpadding="0"
                                          cellspacing="0">
                                          <tbody>
                                              <tr>
                                                  <td align="center">
                                                      <table class="insider" width="100%" border="0" align="center"
                                                          cellpadding="0" cellspacing="0">
                                                          <tbody>
                                                              <tr align="center">
                                                                  <td>
                                                                      <img style=" line-height:0px; font-size:0px; border:0px;"
                                                                          src="https://t3.ftcdn.net/jpg/05/73/88/16/240_F_573881699_kS3RJtEeV7BUZc2MAvEmU59qKwfbrEtP.jpg"
                                                                          width="69" height="78" alt="icon">
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                                  <td height="15"></td>
                                                              </tr>
                                                              <tr align="center">
                                                                  <td
                                                                      style="font-family: 'Raleway', Arial, sans-serif; font-size:20px; color:#2b3c4d; line-height:24px; font-weight: bold;">
                                                                      Premium Garba</td>
                                                              </tr>
                                                              <tr>
                                                                  <td height="10"></td>
                                                              </tr>
                                                              <tr align="center">
                                                                  <td
                                                                      style="font-family: 'Lato', sans-serif; font-size:14px; color:#757575; line-height:24px; font-weight: 300;">
                                                                      Enjoy only at the best grounds</td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td height="30"></td>
                                              </tr>
                                              <tr>
                                                  <td align="center">
                                                      <table class="insider" width="100%" border="0" align="center"
                                                          cellpadding="0" cellspacing="0">
                                                          <tbody>
                                                              <tr align="center">
                                                                  <td>
                                                                      <img style=" line-height:0px; font-size:0px; border:0px;"
                                                                          src="https://t4.ftcdn.net/jpg/06/30/16/35/240_F_630163531_QLg4feJbsEXPXW6Cq9q978jeiMnMaSFI.jpg"
                                                                          width="69" height="78" alt="icon">
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                                  <td height="15"></td>
                                                              </tr>
                                                              <tr align="center">
                                                                  <td
                                                                      style="font-family: 'Raleway', sans-serif; font-size:20px; color:#2b3c4d; line-height:24px; font-weight: bold;">
                                                                      City Centric Locations</td>
                                                              </tr>
                                                              <tr>
                                                                  <td height="10"></td>
                                                              </tr>
                                                              <tr align="center">
                                                                  <td
                                                                      style="font-family: 'Lato', sans-serif; font-size:14px; color:#757575; line-height:24px; font-weight: 300;">
                                                                      Location where everyone can reach</td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td height="30"></td>
                                              </tr>
                                              <tr>
                                                  <td align="center">
                                                      <table class="insider" width="100%" border="0" align="center"
                                                          cellpadding="0" cellspacing="0">
                                                          <tbody>
                                                              <tr align="center">
                                                                  <td>
                                                                      <img style=" line-height:0px; font-size:0px; border:0px;"
                                                                          src=" https://t4.ftcdn.net/jpg/05/55/92/27/240_F_555922705_6ay4h4MnDkyRgTsmVpCEkpzGbKffHTgu.jpg"
                                                                          width="69" height="78" alt="icon">
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                                  <td height="15"></td>
                                                              </tr>
                                                              <tr align="center">
                                                                  <td
                                                                      style="font-family: 'Raleway',  sans-serif; font-size:20px; color:#2b3c4d; line-height:24px; font-weight: bold;">
                                                                      Best Rates for Corporate</td>
                                                              </tr>
                                                              <tr>
                                                                  <td height="10"></td>
                                                              </tr>
                                                              <tr align="center">
                                                                  <td
                                                                      style="font-family: 'Lato', sans-serif; font-size:14px; color:#757575; line-height:24px; font-weight: 300;">
                                                                      Bulk rates for your employees</td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td height="30"></td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </tbody>
                      </table>
                  </td>
              </tr>
  
  
              <tr>
                  <td height="5"></td>
              </tr>
  
  
              <!-- END 3 BOX SHOWCASE -->
  
  
              <!-- START AWESOME TITLE -->
  
              <tr>
                  <td align="center">
                      <table align="center" class="col-600" width="600" border="0" cellspacing="0" cellpadding="0">
                          <tbody>
                              <tr>
                                  <td align="center" bgcolor="#2a3b4c">
                                      <table class="col-600" width="600" align="center" border="0" cellspacing="0"
                                          cellpadding="0">
                                          <tbody>
                                              <tr>
                                                  <td height="33"></td>
                                              </tr>
                                              <tr>
                                                  <td>
  
  
                                                      <table class="col1" width="183" border="0" align="left"
                                                          cellpadding="0" cellspacing="0">
  
                                                          <tbody>
                                                              <tr>
                                                                  <td height="18"></td>
                                                              </tr>
  
                                                              <tr>
                                                                  <td align="center">
                                                                      <img style=" line-height:0px; font-size:0px; border:0px;"
                                                                          class="images_style"
                                                                          src="https://designmodo.com/demo/emailtemplate/images/icon-title.png"
                                                                          alt="img" width="156" height="136">
                                                                  </td>
  
  
  
                                                              </tr>
                                                          </tbody>
                                                      </table>
  
  
  
                                                      <table class="col3_one" width="380" border="0" align="right"
                                                          cellpadding="0" cellspacing="0">
  
                                                          <tbody>
                                                              <tr align="left" valign="top">
                                                                  <td
                                                                      style="font-family: 'Raleway', sans-serif; font-size:20px; color:#f1c40f; line-height:30px; font-weight: bold;">
                                                                      Support for the Arts! </td>
                                                              </tr>
  
  
                                                              <tr>
                                                                  <td height="5"></td>
                                                              </tr>
  
  
                                                              <tr align="left" valign="top">
                                                                  <td
                                                                      style="font-family: 'Lato', sans-serif; font-size:14px; color:#fff; line-height:24px; font-weight: 300;">
                                                                      Garba events provide an excellent opportunity for
                                                                      team bonding
                                                                      and collaboration outside the office.
                                                                      Dancing together creates
                                                                      a sense of unity and teamwork.
                                                                  </td>
                                                              </tr>
  
                                                              <tr>
                                                                  <td height="10"></td>
                                                              </tr>
  
                                                              <tr align="left" valign="top">
                                                                  <td>
                                                                      <table class="button"
                                                                          style="border: 2px solid #fff;"
                                                                          bgcolor="#2b3c4d" width="50%" border="0"
                                                                          cellpadding="0" cellspacing="0">
                                                                          <tbody>
                                                                              <tr >
                                                                                  <td width="10"></td>
                                                                                  <td height="30" align="center"
                                                                                      style="font-family: 'Open Sans', Arial, sans-serif; font-size:13px; color:#ffffff; padding: 10px;">
                                                                                      <a href="tel:8128024338"
                                                                                          style="color:#ffffff;">
                                                                                          Call us today !<div style="padding: 10px;">+91-8128024338</div>
                                                                                      </a>
  
                                                                                  </td>
                                                                                  <td width="10"></td>
                                                                              </tr>
                                                                          </tbody>
                                                                      </table>
                                                                  </td>
                                                              </tr>
  
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td height="33"></td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </tbody>
                      </table>
                  </td>
              </tr>
  
  
              <!-- END AWESOME TITLE -->
  
  
              <!-- START WHAT WE DO -->
  
              <tr>
                  <td align="center" style="background-color: rgb(255, 255, 255);">
                      <table class="col-600" width="600" border="0" align="center" cellpadding="0" cellspacing="0"
                          style="margin-left:20px; margin-right:20px; background-color: rgb(255, 255, 255);">
                          <div style="text-align:center;">
                              <a style="text-decoration:none;color:black;" href="mailto:showmates759@gmail.com">Mail : showmates759@gmail.com</a>
                          </div>
  
  
  
                          <!-- < -->
                      </table>
                  </td>
              </tr>
  
              <!-- END FOOTER -->
  
  
  
          </tbody>
      </table>
  </body>
  
  </html>

    `;



  let result = await emailUtil.sendEmail(
    req.body.email,
    "Showmates-Garba",
    emailContent
  )
  if (result)
    return { statusCode: 200, message: "OTP sent successfully" };
  else
    return { statusCode: -1, message: "Error sending OTP" };

}



//mail for sending qr
exports.sendEpass = async (req, res) => {
  try {
    if (isEmail(req.body.email) == false) {
      return res.json({ statusCode: -1, message: "invalid email format,please try again with valid email!" });
    }
    const qrCodeData = 'Your QR Code Data Here'; // Replace with the actual data for the QR code
    const qrCodeImagePath = path.join(__dirname, '../', 'qrcode.png');

    // Generate the QR code
    await qrCode.toFile(qrCodeImagePath, qrCodeData);

    // Create HTML content for the email
    const htmlContent = `
      <html>
        <head>
          <title>E-Pass QR Code</title>
        </head>
        <body>
          <h1>Hello, Manish Paliwal!</h1>
          <img width="200" height="200" src="https://showmates.in:3000/uploads/event-images/event_image_1688884027655_.jpg" class="poster">
          <p>Here is your e-pass QR code for travel permit on 2023-07-30:</p>
          <img src="cid:qrcode" alt="QR Code" />
        </body>
      </html>
    `;
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
    </style>
    </head>
      <body>
      <div class="m-ticket">
  
      <p class="m">M-Ticket</p>
      
      <div class="movie-details">
        <img src="https://showmates.in:3000/uploads/event-images/event_image_1688884027655_.jpg" class="poster">
        
        <div class="movie">
          <h4>Jawan (U/A)</h4>
          
          <p>Hindi, 2D</p>
          <p>Thu, 7 Sep | 07:45 PM</p>
          <p>INOX Eros One: Jangpura Extn</p>
        </div>
        
      </div>
      
      <div class="info">
        Tap for support, details & more actions
      </div>
      <br>
      <div class="ticket-details">
        <img src="cid:qrcode" class="scan">
        
        <div class="ticket">
          <p>3Ticket(s)</p>
          
          <b>SCREEN 1</b>
          
          <p>PR-J11,J10,J9</p>
          
          <h6>BOOKING ID: Tbafeq7</h6>
          
        </div>
        
      </div>
      
      <div class="info-cancel">
       Cancellation not available for this venue
      </div>
      
      <div class="total-amount">
        <p>Total Amount</p>
        
        <p>Rs. 1041.06</p>
      </div>
      
    </div>
      </body>
    </html>
    `;
    const transporter = nodemailer.createTransport({

      // Transporter configuration
      service: 'gmail',
      auth: {
        user: "showmates759@gmail.com",
        pass: 'tqirroqblfvgwofv'
      }
    });

    // Create a nodemailer transporter
    const info = await transporter.sendMail({
      from: 'showmates759@gmail.com', // Replace with your email address
      to: 'manishpurohit560@gmail.com', // Replace with the recipient's email address
      subject: 'Your E-Pass QR Code',
      html: ticketContent,
      attachments: [{
        filename: 'qrcode.png',
        path: qrCodeImagePath,
        cid: 'qrcode',
      }],
    });


    res.send('Email sent successfully');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

exports.sendEmailToSelfOnSuccessOfOrderExecution = async (data) => {

  // HTML content of the email
  const emailContent = `
<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
<div style="margin:50px auto;width:70%;padding:20px 0">
<div style="border-bottom:1px solid #eee">
<a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Showmates</a>
</div>   
<p style="font-size:1.1em">Hi Team,</p>
<p>An order for event - ${data.eventName} with id-${data.orderId} has been created with payment status - ${data.paymentStatus}</p>
<p>User Details:</p>
<p>Name:-${data.userName}</p>
<p>Email:-${data.userEmail}</p>
<p>Phone:-${data.userPhone}</p>
<hr style="border:none;border-top:1px solid #eee" />
<div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">

<p>Please note that this OTP is time-limited and will expire after a certain period. Enter the OTP accurately in the provided field during the account creation process to proceed further. If you didn't initiate this account creation request, please disregard this email and ensure the security of your account</p>
</div>
</div>
</div>
`;
  let result = await emailUtil.sendEmail(
    'showmates759@gmail.com',
    "New Order Details",
    emailContent
  )
  if (result)
    return { statusCode: 200, message: "OTP sent successfully" };
  else
    return { statusCode: -1, message: "Error sending OTP" };


}