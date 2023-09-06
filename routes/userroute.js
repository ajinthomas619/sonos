const express=require("express");
const user_route=express();
const session=require('express-session');

const config = require("../config/config")

user_route.use(session({secret:config.sessionSecret}));




const auth = require("../middleware/auth")

user_route.set('view engine','ejs');
user_route.set('views','./views/user');

user_route.use(express.json());
user_route.use(express.urlencoded({ extended: true }));


const bodyParser=require("body-parser")
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}))

const userController=require("../controllers/usercontroller");
const cartController=require("../controllers/cartcontroller");


user_route.get('/register',auth.isLogout,userController.loadRegister);

user_route.post('/register',userController.insertUser);
user_route.get('/verify',userController.verifyMail);

user_route.get('/login',auth.isLogout,userController.loginLoad);
user_route.post('/login',userController.verifyLogin);

user_route.get('/',userController.loadHome);

user_route.get('/logout',auth.isLogin,userController.userLogout);

user_route.get('/forget',auth.isLogout,userController.forgetLoad);
user_route.post('/forget',userController.forgetVerify);

user_route.post('/verification',userController.sendOtp)

user_route.post('/otpSubmit',userController.verifyOtp);

user_route.get('/verification1',userController.otpLoad1);
user_route.post('/verification1',userController.sendOtp1);

user_route.post('/otpSubmit1',userController.verifyOtp1);

user_route.post('/verify-otp',userController.verifyOtp);







user_route.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad);


user_route.post('/forget-password',userController.resetPassword);



user_route.get('/verification',userController.otpLoad);



user_route.get('/otpsubmit',userController.otpLoginLoad)


user_route.get('/forget-password1',auth.isLogout,userController.forgetPasswordLoad);

user_route.post('/forget-password1',userController.resetPassword);

user_route.post('/add-to-cart',cartController.addToCart);
user_route.get('/cart',cartController.viewCart);

user_route.put('/updateCartItem/:productId',cartController.updateCartItem);
user_route.delete('/removeFromCart/:productId',cartController.removeFromCart);
user_route.get('/shopproduct/:id',userController.loadShopProduct);






module.exports=user_route;
