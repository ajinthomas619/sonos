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
        console.log(categoryData)
        res.render('addproduct',{categories:categoryData,admin:userData});
    } catch (error) {
        console.log(error.message);
    }

}
const addProduct = async (req, res) => {
    try {
        
        const userData = await admin.findById(req.session.admin_id);
        const categoryData = await Category.findOne({ categoryname: req.body.category })
        console.log("dsfsd",categoryData);
        const Filenames = req.files.map((file) => file.filename);
        const product = new Product({
            productname: req.body.productname,
            description: req.body.description,
            regularprice: req.body.regularprice,
            saleprice: req.body.saleprice,
            category: categoryData.categoryname,
            quantity: req.body.quantity,
            image: Filenames,
            brand:req.body.brand


        });
        console.log(product)
        const productData = await product.save();
        console.log(productData)
        if (productData) {
            res.redirect('productlist');
        }
        else {
            const categoryData = await Category.find()
            console.log(categoryData.name)
            res.render('addproduct', { message: 'Something went wrong',categories:categoryData ,admin:userData});
        }

    } catch (error) {
        console.log(error.message);
    }
}
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
        
         console.log(productData)
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
            Quantity: req.body.quantity,
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
        console.log(id);
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
        console.log(category)
        const categoryData = await category.save();
        console.log(categoryData)
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
        console.log(id)
        const categoryData = await Category.findById({ _id: new ObjectId(id.trim()) }).lean();
        console.log(categoryData)
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
        console.log(id)
        const updateData = {
            categoryname: req.body.productname,
            description: req.body.description,
        };
        console.log(updateData)
        if (req.file) {
            updateData.image = req.file.filename;
        }
        if (req.file) {
            updateData.image = req.file.filename;
        }
        const updatedCategory = await Category.findByIdAndUpdate({ _id: new ObjectId(id.trim()) }, { $set: updateData }, { new: true });
        console.log(updatedCategory)

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
        console.log(id);
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