const Product = require("../models/productmodel");
//const user = require("../models/usermodel");
//const bcrypt = require('bcrypt');
const {ObjectId} = require("mongodb");

const config = require("../config/config");
const mongoose =require('mongoose');

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
     const productname = req.body.productname;
     const description = req.body.description;   
     const regularprice = req.body.regularprice;
     const saleprice = req.body.saleprice;
     const category = req.body.category;
     const Quantity =req.body.Quantity;
     const image =req.file.filename;

const product = new Product ({
     productname:productname,
     description:description,
     regularprice:regularprice,
     saleprice:saleprice,
     category:category,
     Quantity:Quantity,
     image:image

});
console.log(product)
const productData =await product.save();
console.log(productData)
if(productData){
res.redirect('./admin/productlist');
}
else{
res.render('addproduct',{message:'Something went wrong'});
}
      
    } catch (error) {
        console.log(error.message);
    }
}
const productLoad = async(req,res)=>{
    try {
        const productData =await Product.find({});
       res.render('productlist',{products:productData}) 
    } catch (error) {
        console.log(error.message)
    }
}
//edit product
const editProductLoad = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id)
        const productData = await Product.findById({_id:new ObjectId(id.trim())}).lean();
        console.log(productData)
        if (productData) {
            res.render('editproduct', { products: productData });
        } else {
            res.redirect('/home');
        }
    } catch (error) {
        console.log(error.message);
    }
};

const updateProduct = async (req, res) => {
    try {
    
      const updateData = {
        productname: req.body.productname,
        description: req.body.description,
        regularprice: req.body.regularprice,
        saleprice: req.body.saleprice,
        category: req.body.category,
        Quantity: req.body.Quantity,
        image: req.file.filename
      };
  console.log(updateData)
      const updatedProduct = await Product.findByIdAndUpdate({_id:req.body.id}, { $set: updateData }, { new: true });
  
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.redirect('/productlist');
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: 'An error occurred' });
    }
  };
  

module.exports = {
    newProductLoad,
    addProduct,
    productLoad,
    editProductLoad,
    updateProduct
}