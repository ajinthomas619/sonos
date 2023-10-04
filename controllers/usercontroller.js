const user = require('../models/usermodel');
const Product = require("../models/productmodel");
const Category = require("../models/categorymodel");
const Order = require('../models/ordersmodel');
const banner = require("../models/bannermodel");
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const mongoose = require('mongoose');

const config = require("../config/config");

const client = twilio(config.accountSid, config.authToken);

const randomstring = require("randomstring");

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    }
    catch (error) {
        console.log(error.message);
    }
}

//for sending mail

const sendVerifyMail = async (username, email) => {
    try {

        const otp = Math.floor(Math.random() * 9000 + 1000)
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }


        });
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'For Verification Mail',
            text: `OTP for your email verification is : ${otp}`
        }
        console.log(mailOptions)
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error)
            }
            else {
                console.log("Email has been sent:-", info.response);
            }
        })

    }
    catch (error) {
        console.log(error.message)
    }
}



//for reset password

const sendResetPasswordMail = async (username, email, token) => {
    try {

        const otp = Math.floor(Math.random() * 9000 + 1000)
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }


        });
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'For Reset Password',
            text: 'please click here <a href="http://127.0.0.1:3000/forget-password?token=' + token + '">Reset Password</a>'
        }
        console.log(mailOptions)
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error)
            }
            else {
                console.log("Email has been sent:-", info.response);
            }
        })

    }
    catch (error) {
        console.log(error.message)
    }
}




const loadRegister = async (req, res) => {
    try {
        res.render('register')
    }
    catch (error) {
        console.log(error.message)
    }
}

const insertUser = async (req, res) => {
    try {
        const spassword = await securePassword(req.body.password);
        const User = new user({
            username: req.body.username,
            email: req.body.email,
            mobile: req.body.mobile,
            password: spassword,
            is_admin: 0

        });
        const userData = await User.save();
        if (userData) {
            sendVerifyMail(req.body.name, req.body.email, userData._id);
            res.render('register', { message: "signup successfull,please verify your mail" });
        }
        else {
            res.render('register', { message: "oops signup failed" });
        }

    }
    catch (error) {
        console.log(error.message)
    }
}


const verifyMail = async (req, res) => {
    try {
        const updateInfo = await user.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } })
        console.log(updateInfo);
        res.render("email-verified")

    }
    catch (error) {
        console.log(error.message)
    }

}

//login 

const loginLoad = (req, res) => {
    console.log("hjsidfh");
    try {
        console.log(req.cookies);
        if (req.cookies.email)
         {
            console.log("1");
            res.render('login', { email: req.cookies.email, password: req.cookies.password ,checkbox: req.cookies.checkbox})
        }
        else {
            console.log("2");
            res.render('login')
        }
    }
    catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async (req, res) => {
    console.log(req.body);
    try {
        const email = req.body.email;
        const password = req.body.password;


        const userData = await user.findOne({ email: email })
        if (userData) {

            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_verified === 0) {
                    res.render('login', { message: "please verify your mail" })
                }
                else {
                    req.session.user_id = userData._id;
                    console.log(req.cookies)
                    if (req.body.checkbox == 'on') {
                        res.cookie('email',req.body.email);  
                        res.cookie('password',req.body.password);  
                        res.cookie('checkbox',req.body.checkbox);  
                    
                    }
                    console.log(req.cookies)
                    res.redirect('/');
                }

            }
            else {
                res.render('login', { message: "Email and password is incorrect" });
            }

        }
        else {
            res.render('login', { message: "Email and password is incorrect" });
        }
    }
    catch (error) {
        console.log(error.message)
    }
}
const loadHome = async (req, res) => {
    try {
        var search='';
        if(req.query.search){
            search = req.query.search
        }
        console.log(req.query)
        const query = req.query
        const page = query['page ']; // Use trim() to remove leading/trailing spaces
        // if(!req.query.page){
        //     console.log("IFFFFFFFFFFFF")
        //     page=1;
        // }else{
        //     console.log("Elseeeeeeeee")
        //     page = req.query.page
        // }
        console.log("Page NUmber : " , page);
        const limit =5;
      
        const categories = await Category.find({
            $or:[
                {categoryname:{$regex:'.*'+search+'.*'}}
            ]
        }).limit(limit*1)
             .skip((page-1)*limit)
             .exec()
        const products = await Product.find({
            $or:[
                {productname:{$regex:'.*'+search+'.*'}}
            ]
        }).limit(limit*1)
        .skip((page-1)*limit)
        .exec()
        const count = await Product.find({
            $or:[
                {productname:{$regex:'.*'+search+'.*'}}
            ]
        }).countDocuments();

        const banners =await banner.find();
        console.log("banner data ==",banners)
        const userData = await user.findById(req.session.user_id);
        console.log(userData)
        //  console.log(categories);
        res.render('home', { categories: categories, products: products, user: userData ,
        totalPages : Math.ceil(count/limit),currentPage:page,banner:banners})

    }
    catch (error) {
        console.log(error.message)
    }
}

const userLogout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/login');
    }
    catch (error) {
        console.log(error.message)
    }
}


//forget password


const forgetLoad = async (req, res) => {
    try {

        res.render('forget')
    }
    catch (error) {
        console.log(error.message)
    }
}


const forgetVerify = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await user.findOne({ email: email });
        if (userData) {

            if (userData.is_verified === 0) {
                res.render('forget', { message: "Please verify your mail" })
            }
            else {
                const randomString = randomstring.generate();
                const updatedData = await user.updateOne({ email: email }, { $set: { token: randomString } });
                sendResetPasswordMail(userData.username, userData.email, randomString);
                res.render('forget', { message: "please check your mail to reset your password" })
            }

        }
        else {
            res.render('forget', { message: "user email is incorrect" })
        }

    }
    catch (error) {
        console.log(error.message)
    }
}


const forgetPasswordLoad = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await user.findOne({ token: token });
        if (tokenData) {
            res.render('forget-password', { user_id: tokenData._id })
        }
        else {
            res.render('404', { message: "Token is invalid" })
        }

    }
    catch (error) {
        console.log(error.message)
    }
}
const resetPassword = async (req, res) => {
    try {
        console.log(req.body)
        const password = req.body.password;
        const User_id = req.body.user_id;
        const secure_password = await securePassword(password);
        const updatedData = await user.findByIdAndUpdate({ _id: new mongoose.Types.ObjectId(User_id) }, { $set: { password: secure_password, token: ' ' } })
        console.log(updatedData)
        res.redirect("/login")
    } catch (error) {
        console.log(error.message)
    }
}
const otpLoad = async (req, res) => {
    try {
        res.render('verification')
    } catch (error) {
        console.log(error.message)
    }
}

const otpLoad1 = async (req, res) => {
    try {
        res.render('verification1')
    } catch (error) {
        console.log(error.message)
    }
}





const otpLoginLoad = async (req, res) => {
    try {
        res.render('otpsubmit')
    } catch (error) {
        console.log(error.message)
    }
}


const sendOtp = async (req, res) => {
    try {
        const userno = req.body.mobile;
        const otp = Math.floor(Math.random() * 9000 + 1000);
        const otpExpirationTime = new Date(Date.now() + 600000)
        // await client.messages.create({
        //     body: `Your OTP is: ${otp}`,
        //     from:config.twilioNumber,
        //     //to:userno
        //     to:"+919447633403"
        // })
        console.log(otp);
        req.session.otpData = {
            phonenumber: '+919447633403',
            otp: otp,
            otpExpiration: otpExpirationTime

        }
        res.render('otpsubmit')
    }
    catch (error) {
        console.log(error.message)
    }
}
const verifyOtp = async (req, res) => {
    try {
        console.log(req.body)
        const userno = req.body.mobile;
        const userEnteredOTP = req.body.otp;
        const otpData = req.session.otpData;
        if (!otpData) {
            return res.status(400).send('OTP data not found');
        }
        const storedOTP = otpData.otp;
        const otpExpirationTime = otpData.otpExpiration;
        console.log(otpData)
        if (Number(userEnteredOTP) == storedOTP) {
            //res.status(200).send('OTP verified successfully');
            res.render('home')
        }
        else {
            res.status(400).send('Invalid OTP');
        }
    }
    catch (error) {
        console.log(error.message)
    }
}
const sendOtp1 = async (req, res) => {
    try {
        const userno = req.body.mobile;
        const otp = Math.floor(Math.random() * 9000 + 1000);
        const otpExpirationTime = new Date(Date.now() + 600000)
        // await client.messages.create({
        //     body: `Your OTP is: ${otp}`,
        //     from:config.twilioNumber,
        //     //to:userno
        //     to:"+919447633403"
        // })
        console.log(otp);
        req.session.otpData = {
            phonenumber: '+919447633403',
            otp: otp,
            otpExpiration: otpExpirationTime

        }
        res.render('otpsubmit1')

    }

    catch (error) {
        console.log(error.message)
    }
}
const verifyOtp1 = async (req, res) => {
    try {
        console.log(req.body)
        const userno = req.body.mobile;
        const userEnteredOTP = req.body.otp;
        const otpData = req.session.otpData;
        if (!otpData) {
            return res.status(400).send('OTP data not found');
        }
        const storedOTP = otpData.otp;
        const otpExpirationTime = otpData.otpExpiration;
        console.log(otpData)
        if (Number(userEnteredOTP) == storedOTP) {
            res.render('forget-password1')
        }
        else {
            res.status(400).send('Invalid OTP');
        }
    }
    catch (error) {
        console.log(error.message)
    }
}
const loadShopProduct = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id)
        const products = await Product.findById(id)
        const userData = await user.findById(req.session.user_id);
        res.render('shopproduct', { products: products, user: userData })
    }
    catch (error) {
        console.log(error.message)
    }
}

const loadAccount = async (req, res) => {
    try {

        const User = await user.findById(req.session.user_id);
        const orders = await Order.find({ customerId: req.session.user_id });
        console.log('user ==' + User);
        console.log('user address = ' + User.address.length);
        res.render('account', { user: User, orders: orders })

    }
    catch (error) {
        console.log(error.message)
    }
}


//edit address
const loadEditAddress = async (req, res) => {
    try {
        const addressIndex = req.params.id;
        const User = await user.findById(req.session.user_id);
        const address = User.address[addressIndex];
        console.log('address details =' + address);
        res.render('editAddress', { address: address, addressIndex: addressIndex });
    }
    catch (error) {
        console.log(error.message)
    }
}
const editAddress = async (req, res) => {
    try {
        console.log(req.body);
        const User = await user.findById(req.session.user_id);
        const addressId = req.body.addressId;
        console.log(addressId);
        const updatedUser = await user.findOneAndUpdate({
            _id: User._id,
            'address._id': addressId

        },
            {
                $set: {
                    'address.$.name': req.body.name,
                    'address.$.addressLine1': req.body.addressLine1,
                    'address.$.addressLine2': req.body.addressLine2,
                    'address.$.city': req.body.city,
                    'address.$.state': req.body.state,
                    'address.$.pinCode': req.body.pinCode,
                    'address.$.phone': req.body.phone,
                    'address.$.email': req.body.email,
                    'address.$.addressType': req.body.addressType
                }
            },
            { new: true }

        );
        if (updatedUser) {
            console.log('User address updated: ', updatedUser);
            res.redirect('/account')
        }
        else {
            console.log('usernor address not found')
        }

    }
    catch (error) {
        console.log(error.message)
    }

}
const loadAddress = async (req, res) => {
    try {
        res.render('addAddress')
    } catch (error) {
        console.log(error.message)
    }
}

const addAddress = async (req, res) => {
    try {
        const address = {
            name: req.body.name,
            addressLine1: req.body.addressLine1,
            addressLine2: req.body.addressLine2,
            city: req.body.city,
            state: req.body.state,
            pinCode: req.body.pinCode,
            phone: req.body.phone,
            email: req.body.email,
            addressType: req.body.addressType


        }
        console.log('address load=' + address);
        const User = await user.findById(req.session.user_id);
        console.log("dsfds===" + User)
        User.address.push(address);
        await User.save();
        res.redirect('account')
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    sendVerifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    otpLoad,
    otpLoad1,
    otpLoginLoad,
    sendOtp,
    verifyOtp,
    sendOtp1,
    verifyOtp1,
    loadShopProduct,
    loadAccount,
    loadEditAddress,
    editAddress,
    loadAddress,
    addAddress



}