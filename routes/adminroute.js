const express = require("express");

const admin_route = express();


const session = require("express-session");
const config = require("../config/config");
const adminauth =require("../middleware/adminauth");
const adminController = require("../controllers/admincontroller");


admin_route.use(session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: false
  }));


  admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');


admin_route.use(express.json());
admin_route.use(express.urlencoded({ extended: true }));


admin_route.get('/',adminController.loadLogin)


admin_route.post('/',adminController.verifyLogin);

admin_route.get('/home',adminauth.isLogin  ,adminController.loadDashboard);

admin_route.get('/logout',adminauth.isLogin ,adminController.logout);
admin_route.get('/users',adminController.adminDashboard);


 admin_route.get('*',function(req,res){
     res.redirect('/admin')
 })


module.exports = admin_route;

















