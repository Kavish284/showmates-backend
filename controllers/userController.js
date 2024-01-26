const userModel = require("../models/userSchema");
const whatsappNumberModel = require('../models/numberForWhatsappSchema');
const express = require("express");
const bcrypt = require("bcrypt");
const emailController = require('../controllers/emailController');

//get all users
exports.getUsers = async (req, res) => {
    try {
        let result = await userModel.find().select("-password");
        res.json({ statusCode: 200, message: "details retrieved successfully!", data: result });
    } catch (error) {
        console.log(error);
        res.json({ statusCode: -1, message: error.message, data: null });
    }

}

//validating mobile number(india)
const IsValidPhoneNumber = (phoneNumber) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(phoneNumber);
}

exports.addWhatsappNumber = async (req, res) => {
    const whatsappNumber = req.params.whatsappnumber;

    if (!whatsappNumber || !IsValidPhoneNumber(whatsappNumber))
        return res.json({ statusCode: -1, message: "please provide valid phone number" });

    const newWhatsAppNumber = new whatsappNumberModel({
        whatsappNumber: whatsappNumber
    })

    try {

        let existingUser = await whatsappNumberModel.find({ whatsappNumber: whatsappNumber });
        if (existingUser.length !== 0) {
            return res.json({ statusCode: -1, message: "An account with this phone number already exists!,try using different phone number" });
        }

        let result = await newWhatsAppNumber.save();
        return res.json({ statusCode: 200, message: "You are added to showmates community!", data: result });

    } catch (error) {

        if (error.code === 11000) {

            return res.json({ statusCode: -1, message: "email number already added", data: null });
        } else {
            return res.json({ statusCode: -1, message: "error adding number,please try after sometime", data: null });
        }
    }
}

exports.getWhatsappNumber = async (req, res) => {
    try {
        let result = await whatsappNumberModel.find();
        res.json({ statusCode: 200, message: "fetched Whatsapp-number successfully!", data: result });
    } catch (error) {
        res.json({ statusCode: -1, message: error.message, data: null });
    }
}

const generatePassword = (email, length) => {
    const getRandomChar = (characters) => characters[Math.floor(Math.random() * characters.length)];

    // Split email at '@' symbol
    const [emailPart1, emailPart2] = email.split('@');
  
    // Use characters from the email
    let password = emailPart1;
  
    // Add at most 2 special chars
    const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';
    let specialCharCount = 0;
  
    for (let char of specialChars) {
      if (Math.random() < 0.5 && specialCharCount < 2) {
        password += char;
        specialCharCount++;
      }
    }
  
    // Add at most 2 digits
    const digits = '0123456789';
    let digitCount = 0;
  
    for (let char of digits) {
      if (Math.random() < 0.5 && digitCount < 2) {
        password += char;
        digitCount++;
      }
    }
  
    // Shuffle the password to make it more random
    password = password.split('').sort(() => Math.random() - 0.5).join('');
  
    // Ensure the password length is equal to or greater than the specified length
    while (password.length < length) {
      const randomChar = getRandomChar(emailPart2);
      password += randomChar;
    }
  
    // Trim the password to the desired length
    password = password.slice(0, length);
  
    return password;
}


exports.addOrganizer = async (req, res) => {

    const newUser = new userModel({
        name: req.body.name?.trim(),
        email: req.body.email?.trim(),
        password: req.body.password?.trim(),
        phone: req.body.phone?.trim(),
        role: "organizer",
        location: req.body.location?.trim(),
        active: req.body.active
    })
    try {

        const searchQuery = {
            $or: [
                { email: req.body.email?.trim() },
                { phone: req.body.phone?.trim() },
            ]
        };
        let existingUser = await userModel.find(searchQuery);

        if (existingUser.length !== 0) {
            return res.json({ statusCode: -1, message: "phone number or email already exists!,try using different phone number or email" });
        }

        //generating password
        const password = generatePassword(req.body.email?.trim(), 10);
        newUser.password = password;
        existingUser.password=password;
        
        let result = await newUser.save();

        if (result) {

            //sending welcome email
            const data = {
                email: req.body.email?.trim(),
                password: existingUser.password
            }

            await emailController.sendWelcomeEmailForOrganizer(data);

            return res.json({ statusCode: 200, message: "Account created successfully!", data: result });
        }
        return res.json({ statusCode: -1, message: "something went wrong,please try again later!", data: null });
    } catch (error) {

        if (error.code === 11000) {

            res.json({ statusCode: -1, message: "email already exists,try using different email", data: null });
        } else {
            res.json({ statusCode: -1, message: "error creating account,please try after sometime", data: null });
        }
    }

}

//get user by email
exports.getUserByEmail = async (req, res) => {
    try {
        let result = await userModel.findOne({ email: req.query.email, role: req.query.role }).select("-password");

        if (result) {
            res.json({ statusCode: 200, message: "Login successful!", data: result });
        } else {
            res.json({ statusCode: -1, message: "email already exists!", data: null });
        }
    } catch (error) {
        res.json({ statusCode: -2, message: "error fetching details,please try again later", data: null });
    }
}

//get user by phone
exports.getUserByPhone = async (req, res) => {
    try {
        let result = await userModel.findOne({ phone: req.query.phone, role: req.query.role }).select("-password");

        if (result) {
            res.json({ statusCode: 200, message: "Login successful!", data: result });
        } else {
            res.json({ statusCode: -1, message: "mobile number already exists", data: null });
        }
    } catch (error) {
        res.json({ statusCode: -2, message: "error fetching details,please try again later", data: null });
    }
}

exports.getAllOragnizers = async (req, res) => {

    try {

        let result = await userModel.find({ role: "organizer" });
        res.json({ statusCode: 200, message: "Account details retrieved successfully!", data: result });
    } catch (error) {
        res.json({ statusCode: -1, message: error.message, data: null });
    }
}

exports.getAllUsers = async (req, res) => {

    try {

        let result = await userModel.find({ role: "customer" });
        res.json({ statusCode: 200, message: "Account details retrieved successfully!", data: result });
    } catch (error) {
        res.json({ statusCode: -1, message: error.message, data: null });
    }
}

exports.deactivateUserAccount = async (req, res) => {
    try {

        let userData = await userModel.findById(req.params.id);
        if (!userData) {
            return res.json({ statusCode: -1, message: "No such user found!" });
        }
        if (userData.active) {
            userData.active = false;
            let result = await userData.save();

            return res.json({ statusCode: 200, message: "user deactivated!" });
        } else {
            userData.active = true;
            let result = await userData.save();

            return res.json({ statusCode: 200, message: "user activated!" });
        }


    } catch (error) {
        return res.json({ statusCode: -1, message: "error processing request,try after sometime!" });
    }
}
//get user by id
exports.getUserById = async (req, res) => {
    try {

        let result = await userModel.findById({ _id: req.query.id });
        return res.json({ statusCode: 200, message: "Account details retrieved successfully!", data: result });
    } catch (error) {
        console.log(error);
        return res.json({ statusCode: -1, message: error.message, data: null });
    }
}


//update user
exports.updateUser = async (req, res) => {
    try {
        // Encrypt password if included in the request body
        // if (req.body.password) {
        //     const salt = await bcrypt.genSalt(10);
        //     req.body.password = await bcrypt.hash(req.body.password, salt);

        // }
        let userExists = await userModel.findOne({ _id: req.params.id, role: req.body.role });

        if (userExists) {

            if (req.body.phone.trim().length > 0) {
                let phoneNumberExists = await userModel.findOne({ phone: req.body.phone });
                if (phoneNumberExists && phoneNumberExists?._id.toString() !== userExists?._id.toString()) {

                    return res.json({ statusCode: -1, message: "phone number already registered with another account!", data: null });
                }
            }
            if (req.body.email.trim().length > 0) {
                let emailExists = await userModel.findOne({ email: req.body.email });
                if (emailExists && emailExists?._id?.toString() !== userExists?._id?.toString()) {

                    return res.json({ statusCode: -1, message: "email already registered with another account!", data: null });
                }
            }


            let result = await userModel.findByIdAndUpdate({ _id: req.params.id }, {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                phone: req.body.phone,
                role: req.body.role,
                birthdate: req.body.birthdate,
                location: req.body.location
            }).select("-password");

            return res.json({ statusCode: 200, message: "Account updated successfully!", data: result });

        } else {
            return res.json({ statusCode: -1, message: "No such account details found,please try again later!", data: null });
        }
    } catch (error) {
        console.log(error);
        res.json({ statusCode: -1, message: error.message, data: null });
    }
}



exports.deleteUserById = async (req, res) => {

    try {
        let result = await userModel.findByIdAndDelete({ _id: req.params.id }).select("-password");
        res.json({ statusCode: 200, message: "Account deleted successfully!", data: result });
    } catch (error) {
        res.json({ statusCode: -1, message: "error deleting account,try after sometime!", data: null });
    }
}

