const nodemailer = require('nodemailer');
const hostMail = 'showmates759@gmail.com';
exports.sendEmail = async (to,subject,body) => {
    try {
        const transporter = nodemailer.createTransport({
        
            // Transporter configuration
            service: 'gmail',
            auth: {
                user: hostMail,
                pass: 'tqirroqblfvgwofv'
            }
        });
        
        // Define the email options
        const mailOptions = {
            from: hostMail,
            to: to,
            subject: subject,
            html: body
        };
        mailOptions.headers={
            'Content-Type':"text/html"
        }
        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                
                    console.error('Error sending email:', error);
                    return false;
            } else {

                console.log('Email sent successfully:', info.response);
                return true;
            }
        });
    } catch (error) {
        // Handle errors
    }
}

