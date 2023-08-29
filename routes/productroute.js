const express=require("express")
const product_route=express()


const session=require("express-session")
const config=require("../config/config")
product_route.use(session({secret:config.sessionSecret}))

const bodyParser=require("body-parser")
product_route.use(bodyParser.json())
product_route.use(bodyParser.urlencoded({extended:true}))


product_route.set('view engine','ejs')
product_route.set('views','./views/admin')

const multer=require("multer")
const path=require("path")

product_route.use(express.static('public'))


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

const auth=require('../middleware/adminauth');

const productController=require("../controllers/productcontroller");
product_route.get('/addproduct',auth.isLogin,productController.newProductLoad);
product_route.post('/addproduct',upload.single('image'), productController.addProduct);


product_route.get('/productlist',auth.isLogin,productController.productLoad);
product_route.get('/editproduct/:id',productController.editProductLoad);
product_route.post('/editproduct/:id',upload.single('image'),productController.updateProduct);


module.exports = product_route;