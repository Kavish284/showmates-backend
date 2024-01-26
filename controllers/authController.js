const userModel = require('../models/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailController = require('../controllers/emailController');
const { default: axios } = require('axios');
const encryptionUtils = require('../utils/encryptionUtils');

exports.signup = async (req, res) => {

    //data come for singup
    const newUser = new userModel({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone,
        role: req.body.role,
        location: req.body.location
    });

    //check if such user already exists
    try {
        const existingUser = await userModel.findOne({ email: email });

        if (existingUser) {
            return res.json({ statusCode: -1, message: "user with this email already exists!,try using different email", data: null });
        }

        //creating hash password to store in db as we didnt find any existing user with such data
        const hashedPassword = await bcrypt.hash(password, 10);

        //changing the encrypted password for new user and save in db
        newUser.password = hashedPassword;
        const result = await userModel.create(newUser);

        //now as user us register lets generate token
        const token = jwt.sign({ id: result._id, role: result.role }, "secret key", { expiresIn: "30 days" });

        return res.json({ statusCode: 200, message: "signup successfully!", token: token });

    } catch (error) {
        return res.json({ statusCode: -1, message: "error creating user!", })
    }

}

//for admin
exports.loginByEmailAndPassword = async (req, res) => {

    const { email, password } = req.body;

    try {
        const existingUser = await userModel.findOne({
            email: email, $or: [
                { role: 'admin' },
                { role: 'organizer' }
            ],
        });
        if (!existingUser) {
            return res.json({ statusCode: -1, message: "no such user details found!", data: null });
        }
        if (existingUser.password !== password) {
            return res.json({ statusCode: -1, message: "Password is incorrect!", data: null });
        }
        if(!existingUser.active)
            return res.json({statusCode:-1,message:"Your account is deactivated,please connect to showmates!"});
        const token = jwt.sign({ id: existingUser._id, role: existingUser.role }, "secret key", { expiresIn: "30 days" });
        return res.json({ statusCode: 200, message: existingUser.role + " login successfully!", data: existingUser, token: token });


        //now as user is login lets generate token
        //email and id will be return as user object if token matches in auth middleware 
        // const token = jwt.sign({id:existingUser._id,role:existingUser.role},"secret key",{expiresIn:"30 days"});
        // res.json({statusCode:200,message:"user login successfully!",data:existingUser,token:token}); 
    } catch (error) {
        console.log(error);
        return res.json({ statusCode: -1, message: "something went wrong!" });
    }
}
exports.verifyEmailForOrgAndAdmin = async (req, res) => {

    const { email } = req.body;

    try {
        const user = await userModel.findOne({
            email: email, $or: [
                { role: 'admin' },
                { role: 'organizer' }
            ]
        })

        if (!user) {
            return res.json({ statusCode: -1, message: "no user exists with such email" });
        }
        return res.json({ statusCode: 200, message: "user found" });

    } catch (error) {
        console.log(error);
        return res.json({ statusCode: -1, message: "something went wrong!" });
    }
}

exports.verifyCustomerEmail =
    async (req, res) => {

        const { email } = req.body;

        try {
            const user = await userModel.findOne({
                email: email, $or: [
                    { role: 'admin' },
                    { role: 'organizer' }
                ]
            })

            if (!user) {
                return res.json({ statusCode: -1, message: "no user exists with such email" });
            }
            return res.json({ statusCode: 200, message: "user found" });

        } catch (error) {
            console.log(error);
            return res.json({ statusCode: -1, message: "something went wrong!" });
        }
    }
exports.loginByEmail = async (req, res) => {

    const email = req.body.email;
    const role = req.body.role;
    forgotPasswordAdminPanel = req.body.forgotPasswordAdminPanel;

    try {
        const existingUser = await userModel.findOne({ email: email })


        if (existingUser && role == 'customer') {
            
            if (role == existingUser.role) {
                const token = jwt.sign({ id: existingUser._id, role: existingUser.role }, "secret key", { expiresIn: "30 days" });
                return res.json({ statusCode: 200, message: "login successful!", data: existingUser, token: token });
            } else {
                return res.json({ statusCode: -1, message: "please try different email!,this email is already registered with different account" });
            }
        }
        else if (existingUser && role != 'customer' && forgotPasswordAdminPanel) {
            const token = jwt.sign({ id: existingUser._id, role: existingUser.role }, "secret key", { expiresIn: "30 days" });
            return res.json({ statusCode: 200, message: "login successful!", data: existingUser, token: token });
        }
        if (!existingUser && role == 'customer') {

            if (isEmail(req.body.email) == false) {
                return res.json({ statusCode: -1, message: "invalid format for email!" });
            }
            const newUser = new userModel({

                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                phone: req.body.phone,
                role: "customer",
                location: req.body.location
            });

            const result = await userModel.create(newUser);
            const token = jwt.sign({ id: result._id, role: result.role }, "secret key", { expiresIn: "30 days" });
            return res.json({ statusCode: 200, message: "account created successfully!", data: result, token: token });

        }

    } catch (error) {
        console.log(error);
        return res.json({ statusCode: -1, message: "something went wrong!,please try again later" });
    }
}

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
exports.loginByPhone = async (req, res) => {
    
    const { phone, role } = req.body;

    try {
        const existingUser = await userModel.findOne({ phone: phone });
        if (existingUser) {
            if (role == existingUser.role) {
                const token = jwt.sign({ id: existingUser._id, role: existingUser.role }, "secret key", { expiresIn: "30 days" });
                return res.json({ statusCode: 200, message: "login successful!", data: existingUser, token: token });
            } else {
                return res.json({ statusCode: -1, message: "Please try different number!,this number is already registered with different account" });
            }
        }
        if (!existingUser && role == 'customer') {

          
            //no such existing user so creating user
            const newUser = new userModel({

                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                phone: req.body.phone,
                role: "customer",
                location: req.body.location
            });

            const result = await userModel.create(newUser);
            const token = jwt.sign({ id: result._id, role: result.role }, "secret key", { expiresIn: "30 days" });
            return res.json({ statusCode: 200, message: "account created successfully!", data: result, token: token });
        }

        //now as user is created lets generate token
        //email and id will be return as user object if token matches in auth middleware 
        // const token = jwt.sign({id:existingUser._id,role:existingUser.role},"secret key",{expiresIn:"30 days"});
        // return res.json({statusCode:200,message:"login successful!",data:existingUser,token:token}); 
    } catch (error) {
        console.log(error);
        return res.json({ statusCode: -1, message: "something went wrong!" });
    }
}


exports.sendOTP = async (req, res) => {


    const number = req.body.number;

    //generating OTP
    const min = 100000; // Minimum value of the random number (inclusive)
    const max = 999999; // Maximum value of the random number (inclusive)

    // Generate a random number within the specified range
    const OTP = Math.floor(Math.random() * (max - min + 1)) + min;


    if (number && OTP) {

        const data = {
            number: number,
            OTP: OTP
        }
        const encryptedData = encryptionUtils.encryptData(data);

        console.log(data)
      
        const api = "https://web.shreesms.net/API/SendSMS.aspx?APIkey=EcRoH5D5Wa4i7PIUYB5c0jyU1b&SenderID=SHWMTS&SMSType=2&Mobile=" + number + "&MsgText=Hello mate! " + OTP + " is your OTP to Login Showmates. Do not share with anyone.&EntityID=1701169590003487348&TemplateID=1707169597691670672";
        await axios.get(api).then((response) => {
            
           return res.json({ statusCode: 200, message: "OTP sent successfully!", data: encryptedData });
        }).catch((error) => {
            return res.json({ statusCode: -1, message: "Error sending OTP!" });
        })

    } else {
        return res.json({ statusCode: -1, message: "Error sending OTP!" });
    }
}
 