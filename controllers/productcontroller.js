const Product = require("../models/productmodel");
const Category = require("../models/categorymodel");
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
        const id = req.params.id;
        console.log(id)
      const updateData = {
        productname: req.body.productname,
        description: req.body.description,
        regularprice: req.body.regularprice,
        saleprice: req.body.saleprice,
        category: req.body.category,
        Quantity: req.body.Quantity,
      };
  console.log(updateData)
  if (req.file) {
    updateData.image = req.file.filename;
}
  if (req.file) {
    updateData.image = req.file.filename;
}
      const updatedProduct = await Product.findByIdAndUpdate({_id:new ObjectId(id.trim())}, { $set: updateData }, { new: true });
      console.log(updatedProduct)
  
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.redirect('/productlist');
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: 'An error occurred' });
    }
  };
  //delete products

  const deleteProduct =  async(req,res)=>{
    try{
        const id=req.params.id;
        console.log(id);
        await Product.findByIdAndDelete({_id:new ObjectId(id.trim())});
        res.redirect('/productlist')
    }
    catch(error){
        console.log(error.message);
    }
  }
  const loadCategory = async (req, res) => {
    try {
        const categories = await Category.find().lean(); // Fetch all categories from the database
        res.render('categories', { categories }); // Pass the categories to the view
    } catch (error) {
        console.log(error.message);
    }
}

const addCategory = async(req,res)=>{
    try {
     const categoryname = req.body.categoryname;
     const description = req.body.description;   
     const image =req.file.filename;

const category = new Category ({
     categoryname:categoryname,
     description:description,
     image:image

});
console.log(category)
const categoryData =await category.save();
console.log(categoryData)
if(categoryData){
res.redirect('/categories');
}
else{
res.render('categories',{message:'Something went wrong'});
}
      
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    newProductLoad,
    addProduct,
    productLoad,
    editProductLoad,
    updateProduct,
    deleteProduct,
    loadCategory,
    addCategory

}