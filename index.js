const mongoose=require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/sonos",{
useNewUrlParser: true,
useUnifiedTopology:true
});
const path = require('path')


const express = require("express");
const app = express();
app.use('/assets',express.static(path.resolve(__dirname,'public/assets')))
app.use('/asset',express.static(path.resolve(__dirname,'public/asset')))
app.set('view engine','ejs');
app.set('views','./views/user');
const logger = require('morgan');
app.use(logger('dev'));


const nocache = require('nocache');
app.use(nocache());






app.get('/register',function(req,res){

  res.render('register');

})
app.get('/login',function(req,res){

    res.render('login');
  
  })

  //for user routes
  const userRoute=require('./routes/userroute')
  app.use('/',userRoute )


    //for admin routes
    const adminRoute=require('./routes/adminroute')
    app.use('/admin',adminRoute )

    //for product routes
     const productRoute = require('./routes/productroute');
     app.use('/', productRoute )

app.listen(3000,function(){
    console.log("server is running")
})