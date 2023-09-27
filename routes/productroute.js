const express=require("express")

const product_route=express()


const session=require("express-session")
const config=require("../config/config")
product_route.use(session({secret:config.sessionSecret}))






product_route.set('view engine','ejs')
product_route.set('views',['./views/admin', './views/user'])

// product_route.set('view engine','ejs')
// product_route.set('views','./views/user')





const productController = require("../controllers/productcontroller");
const orderController = require("../controllers/ordercontroller");

const bodyParser=require("body-parser")
product_route.use(bodyParser.json())
product_route.use(bodyParser.urlencoded({extended:true}))





const path=require("path")
product_route.use(express.static('public'))
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

const categoryStorage = multer.diskStorage({
    destination :(req,file,cb) => {
      cb(null,path.join(__dirname, '../public/productimages'))
    },
    filename : (req, file, cb) => {
      cb(null, Date.now() +'-'+ file.originalname)
    }
  })
  const categoryUpload = multer({storage : categoryStorage})
  
  const productStorage = multer.diskStorage({
    destination :(req,file,cb) => {
      cb(null,path.join(__dirname, '../public/productimages'))
    },
    filename : (req, file, cb) => {
      cb(null, Date.now() +'-'+ file.originalname)
    }
  })
  const productUpload = multer({storage :productStorage})

 const auth=require('../middleware/adminauth');




product_route.get('/addproduct',auth.isLogin,productController.newProductLoad);
product_route.post('/addproduct',productUpload.array('image'), productController.addProduct);


product_route.get('/productlist',auth.isLogin,productController.productLoad);
product_route.get('/editproduct/:id',productController.editProductLoad);
product_route.post('/editproduct/:id',productUpload.array('image'),productController.updateProduct);
product_route.get('/productlist/:id',productController.deleteProduct);
 product_route.get('/categories',productController.loadCategory);
product_route.post('/categories',categoryUpload.single('image'), productController.addCategory);
product_route.get('/editcategories/:id',productController.editCategoryLoad);
product_route.post('/editcategories/:id',categoryUpload.single('image'),productController.updateCategory);
product_route.get('/categories/:id',productController.deleteCategory);
product_route.get('/orderdetails/:id',orderController.loadOrderDetails);
product_route.get('/checkout',orderController.loadPlaceOrder);
product_route.get('/shopcategories/:id',productController.lookupProduct);
product_route.post('/checkout',orderController.checkout);
product_route.get('/order-success',orderController.orderSuccess);
product_route.get('/order-cancel/:id',orderController.cancelOrder);
product_route.post('/verify-payment',orderController.verifyPayment);
product_route.get('/orderlist',orderController.loadOrderList);


module.exports = product_route;
