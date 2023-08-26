const Product = require("../models/productmodel");
//const user = require("../models/usermodel");
//const bcrypt = require('bcrypt');

const config = require("../config/config");


//add product
const newProductLoad = async(req,res)=>{
try {
    res.render('addproduct');
} catch (error) {
    console.log(error.message);
}

}
const addProduct = async(req,res)=>{
    try {
        const product = new Product({
      productname:req.body.productname,
      description : req.body.description,   
      regularprice : req.body.regularprice,
      saleprice : req.body.saleprice,
      category :req.body.category,
      Quantity :req.body.Quantity,
      image :req.file.filename
        });
        console.log(product);
// const product = new Product ({
//      productname:productname,
//      description:description,
//      regularprice:regularprice,
//      saleprice:saleprice,
//      category:category,
//      Quantity:Quantity,
//      image:image

// });
const productData =await  Product.save();
console.log(productData)
if(productData){
res.redirect('/admin/productlist');
}
else{
res.render('addproduct',{message:'Something went wrong'});
}
      
    } catch (error) {
        console.log(error.message);
    }
}




module.exports = {
    newProductLoad,
    addProduct
}