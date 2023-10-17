const Product = require("../models/productmodel");
const Category = require("../models/categorymodel")
const admin = require("../models/adminmodel");;

//const bcrypt = require('bcrypt');
const { ObjectId } = require("mongodb");

const config = require("../config/config");
const mongoose = require('mongoose');
const userdata = require("../models/usermodel");

//add product
const newProductLoad = async (req, res) => {
    try {
        
        const userData = await admin.findById(req.session.admin_id);
        const categoryData = await Category.find()
        
        res.render('addproduct',{categories:categoryData,admin:userData});
    } catch (error) {
        console.log(error.message);
    }

}
const addProduct = async (req, res) => {
    try {
        const userData = await admin.findById(req.session.admin_id);
        const categoryData = await Category.findOne({ categoryname: req.body.category });
       
        const Filenames = req.files.map((file) => file.filename);

        // Validate the product price
        const quantity =parseFloat(req.body.quantity)
        const regularPrice = parseFloat(req.body.regularprice);
        const salePrice = parseFloat(req.body.saleprice);
        if (isNaN(regularPrice) || isNaN(salePrice) || isNaN(quantity) || regularPrice < 0 || salePrice < 0 || quantity<0) {
            const categoryData = await Category.find();
            return res.render('addproduct', { message: 'Invalid data', categories: categoryData, admin: userData });
        }

        const product = new Product({
            productname: req.body.productname,
            description: req.body.description,
            regularprice: regularPrice,
            saleprice: salePrice,
            category: categoryData.categoryname,
            quantity: req.body.quantity,
            image: Filenames,
            brand: req.body.brand
        });

      
        const productData = await product.save();
     
        if (productData) {
            res.redirect('productlist');
        } else {
            const categoryData = await Category.find();
           
            res.render('addproduct', { message: 'Something went wrong', categories: categoryData, admin: userData });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const productLoad = async (req, res) => {
    try {
        const userData = await admin.findById(req.session.admin_id);
        const productData = await Product.find({});
        res.render('productlist', { products: productData,admin:userData })
    } catch (error) {
        console.log(error.message)
    }
}
//edit product
const editProductLoad = async (req, res) => {
    try {
        const userData = await admin.findById(req.session.admin_id);
        const id = req.params.id;
        console.log(id)
        const categoryData = await Category.find();
        const productData = await Product.findById( { _id: new ObjectId(id.trim())  }).populate(
            "category")
        
        
        // console.log(categoryData)
        if (productData) {
            res.render('editproduct', { products: productData,categories:categoryData ,admin:userData});
        } else {
            res.redirect('/admin/home');
        }
    } catch (error) {
        console.log(error.message);
    }
};

const updateProduct = async (req, res) => {
    try {
        console.log("body:-",req.body)
        
        console.log("fileee:-")
        console.log(req.files);
        const userData = await admin.findById(req.session.admin_id);
      
        const quantity =parseFloat(req.body.quantity)
        const regularPrice = parseFloat(req.body.regularprice);
        const salePrice = parseFloat(req.body.saleprice);
        if (isNaN(regularPrice) || isNaN(salePrice) || isNaN(quantity) || regularPrice < 10 || salePrice < 10 || quantity<1) {
            const categoryData = await Category.find();
          
            return res.render('addproduct', { message: 'Invalid data', categories: categoryData, admin: userData });
        }
     const imageFilenames = req.files.map(file=>file.filename);
     console.log("image file :-",imageFilenames)
     const categoryData = await Category.findOne({categoryname:req.body.category});
   
          
     console.log("dsfkdaefd",categoryData)
        const id = req.params.id;

        console.log("iddd:-",id)
        const updateData = {
            productname: req.body.productname,
            description: req.body.description,
            regularprice: req.body.regularprice,
            saleprice: req.body.saleprice,
            category: categoryData.categoryname,
            quantity: req.body.quantity,
            brand:req.body.brand

        };
        console.log("updated dataa:-",updateData)
        
        if (req.files) {
            console.log("sdfdsfds",req.files)
            updateData.image = imageFilenames;
            console.log("update ====",updateData.image)
        }

        const updatedProduct = await Product.findByIdAndUpdate({ _id: new ObjectId(id.trim()) }, { $set: updateData }, { new: true });
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

const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
       
        await Product.findByIdAndDelete({ _id: new ObjectId(id.trim()) });
        res.redirect('/productlist')
    }
    catch (error) {
        console.log(error.message);
    }
}
const loadCategory = async (req, res) => {
    try {
        const userData = await admin.findById(req.session.admin_id);
        const categoryData = await Category.find().lean(); // Fetch all categories from the database
        res.render('categories', { categories: categoryData,admin:userData }); // Pass the categories to the view
    } catch (error) {
        console.log(error.message);
    }
}

const addCategory = async (req, res) => {
    try {
        const categoryname = req.body.categoryname;
        const description = req.body.description;
        const image = req.file.filename;

        const category = new Category({
            categoryname: categoryname,
            description: description,
            image: image

        });
       
        const categoryData = await category.save();
      
        if (categoryData) {
            res.redirect('/categories');
        }
        else {
            res.render('categories', { message: 'Something went wrong' });
        }

    } catch (error) {
        console.log(error.message);
    }
}

//edit category
const editCategoryLoad = async (req, res) => {
    try {
        const userData = await admin.findById(req.session.admin_id);
        const id = req.params.id;
       
        const categoryData = await Category.findById({ _id: new ObjectId(id.trim()) }).lean();
       
        if (categoryData) {
            res.render('editcategories', { categories: categoryData,admin:userData });
        } else {
            res.redirect('/admin/home');
        }
    } catch (error) {
        console.log(error.message);
    }
};

const updateCategory = async (req, res) => {
    try {
        const id = req.params.id;
      
        const updateData = {
            categoryname: req.body.productname,
            description: req.body.description,
        };
        
        if (req.file) {
            updateData.image = req.file.filename;
        }
        if (req.file) {
            updateData.image = req.file.filename;
        }
        const updatedCategory = await Category.findByIdAndUpdate({ _id: new ObjectId(id.trim()) }, { $set: updateData }, { new: true });
       

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.redirect('/categories');
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'An error occurred' });
    }
};
//delete products

const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        
        await Category.findByIdAndDelete({ _id: new ObjectId(id.trim()) });
        res.redirect('/categories')
    }
    catch (error) {
        console.log(error.message);
    }
}
const lookupProduct= async (req,res)=>{
    try{
        const id = req.params.id
       console.log("id"+id)
      const categoryName= await Category.findById(id);
      const user = await userdata.find()
      const name = categoryName.categoryname
      console.log(name);
      const product =await Product.find({category:name})
       console.log('pname='+ product);
       res.render('shopcategories',{product:product, products: product,user:user})
    }
    catch(error){
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
    addCategory,
    editCategoryLoad,
    updateCategory,
    deleteCategory,
    lookupProduct

}