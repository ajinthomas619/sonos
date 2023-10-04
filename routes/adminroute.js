const express = require("express");

const admin_route = express();


const session = require("express-session");
const config = require("../config/config");
const adminauth =require("../middleware/adminauth");
const adminController = require("../controllers/admincontroller");
const couponController = require("../controllers/couponcontroller");
const bannerController = require("../controllers/bannercontroller");
const orderController = require("../controllers/ordercontroller");
admin_route.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false
  }));


  admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');


admin_route.use(express.json());
admin_route.use(express.urlencoded({ extended: true }));
const path=require("path")
const multer=require("multer")


const storage=multer.diskStorage({
  destination:function(req,file,cb){
  cb(null,path.join(__dirname,'../public/productimages'))
  },
  filename:function(req,file,cb){
   const name = Date.now()+'-'+file.originalname
   cb(null,name)
  }
 
 })
 const upload=multer({storage:storage})
 
const bannerStorage = multer.diskStorage({
  destination :(req,file,cb) => {
    cb(null,path.join(__dirname, '../public/productimages'))
  },
  filename : (req, file, cb) => {
    cb(null, Date.now() +'-'+ file.originalname)
  }
})
const bannerUpload = multer({storage : bannerStorage})


admin_route.get('/',adminController.loadLogin)


admin_route.post('/',adminController.verifyLogin);

admin_route.get('/home',adminauth.isLogin  ,adminController.loadDashboard);

admin_route.get('/logout',adminauth.isLogin ,adminController.logout);
admin_route.get('/users',adminController.adminDashboard);
admin_route.post('/blockuser',adminController.blockuser);
admin_route.post('/unblockuser',adminController.unblockuser);
admin_route.get('/addcoupon',couponController.loadAddCoupon);
admin_route.post('/addcoupon',couponController.addCoupon);
admin_route.get('/coupons',couponController.loadCoupon);
admin_route.post('/blockcoupon',couponController.blockCoupon);
admin_route.post('/unblockcoupon',couponController.unblockCoupon);
admin_route.get('/addbanner',bannerController.loadAddBanner);
admin_route.post('/addbanner',bannerUpload.single('image'),bannerController.addBanner);
admin_route.get('/banners',bannerController.loadBanner);
admin_route.get('/banners/:id',bannerController.deleteBanner);
admin_route.post('/print-invoice',orderController.printInvoice);


 admin_route.get('*',function(req,res){
     res.redirect('/admin')
 })


module.exports = admin_route;

















