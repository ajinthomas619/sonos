const mongoose=require("mongoose");
mongoose.connect("mongodb+srv://ajinthomas619:Motog31@cluster0.u9qv5iq.mongodb.net/sonos",{
useNewUrlParser: true,
useUnifiedTopology:true
}).then(() => {
  console.log("Connected to MongoDB Atlas");
}).catch((error) => {
  console.error("Error connecting to MongoDB Atlas: ", error);
});
const path = require('path')


const express = require("express");
const app = express();
app.use('/public',express.static(path.resolve(__dirname,'public')))
app.use('/assets',express.static(path.resolve(__dirname,'public/assets')))
app.use('/asset',express.static(path.resolve(__dirname,'public/asset')))
app.set('view engine','ejs');
app.set('views','./views/user');
const logger = require('morgan');
app.use(logger('dev'));


const nocache = require('nocache');
app.use(nocache());

const cors = require('cors');
app.use(cors());




// app.get('/register',function(req,res){

//   res.render('register');

// })
// app.get('/login',function(req,res){

//     res.render('login');
  
//   })

  //for user routes
  const userRoute=require('./routes/userroute')
  app.use('/',userRoute )


    //for admin routes
    const adminRoute=require('./routes/adminroute')
    app.use('/admin',adminRoute )

    //for product routes
     const productRoute = require('./routes/productroute');
     app.use('/', productRoute )

     const port = process.env.PORT||3000;

app.listen(port,function(){
    console.log(`server is running on port ${port}`)
})