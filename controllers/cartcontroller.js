const Product = require("../models/productmodel");
const userdata = require('../models/usermodel');
const mongoose = require('mongoose');
const { ObjectId } = require("mongodb");
const mongodb = require('mongodb')


const addToCart = async (req, res) => {
    try {
        const userId = req.session.user_id
        const proId = req.body.id
        const price = parseInt(req.body.price)
        const quantity=1;
        let userData = await userdata.findByIdAndUpdate(userId ,
                    { $push: { cart: {proId,
                    quantity:quantity,
                    } } }
        )
        res.json(true)
        // const productId = req.body.id;
        // console.log('productid:-'+productId)
        // const product = await Product.findById(productId);
        // console.log(product)
    

        // if (!product) {
        //     return res.status(404).json({ message: 'Product not found' });
        // }

        //  const userId = req.session.user_id;
        //  console.log(userId)
        //  console.log('user id:-'+userId)
        //  const user = await userdata.findById(userId)
        //  console.log('user:-'+user)
        //  if(!user){
        //     return res.status(404).json({message:'User not found'})
        //  }

        //  const quantity = parseInt(req.body.quantity, 10);
        //  console.log('quantity:' +quantity)
        // const existingItem = user.cart.items.find((item)=>(
        //     item.productId.equals(productId) 
        // ));

        // if (existingItem) {
        //     existingItem.quantity += quantity;
        // } else {
        //    user. cart.items.push({
        //         product: product._id,
        //         quantity: quantity,
        //         price: product.price,
        //     });
        // }


        // await user.save(); // Save the cart instance, not Cart model

        // res.status(200).json({ message: 'Product added to cart successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const viewCart = async (req, res) => {
    try{
        let userSession = req.session.user_id;
        const oid = new mongodb.ObjectId(userSession);
        let data = await userdata.aggregate([
            {$match:{_id:oid}},
            {$unwind:'$cart'},
            {$project:{
                proId:{'$toObjectId':'$cart.proId'},
                quantity:'$cart.quantity',
                // size:'$cart.size'
            }},
            {$lookup:{
                from:'products',
                localField:'proId', 
                foreignField:'_id',
                as:'ProductDetails',
            }},


        ])
        let GrandTotal = 0
        for(let i=0;i<data.length;i++){
            let qua = parseInt(data[i].quantity);
            GrandTotal = GrandTotal+(qua*parseInt(data[i].ProductDetails[0].sale_price))
        }
        res.render('cart' , {products:data , GrandTotal})
    }catch(err){
        console.log(err)
        res.send("Error")
        }
    }

const updateCartItem = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const proIdToUpdate = req.body.id;
        const newQuantity = parseInt(req.body.quantity);

        // Find the user by ID
        const user = await userdata.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the cart item with the matching product ID
        const cartItem = user.cart.find((item) => item.proId === proIdToUpdate);

        if (!cartItem) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        // Update the quantity of the cart item
        cartItem.quantity = newQuantity;

        // Save the updated user document
        await user.save();

        res.status(200).json({ message: 'Cart updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }

}
const removeFromCart = async (req, res) => {
     try {
        const userSession = req.session.user_id;
        userdata.updateOne(
            {_id: userSession},
            {$pull: {cart: {proId: req.params.id}}
        }).then((status)=>{
            res.redirect('/cart')
        }).catch((err)=>{
            console.log(err.message);
        })
     } catch (error) {
      console.log(error.message)  
     }
} 
const addToWishlist = async (req, res) => {
    try {
        const userId = req.session.user_id
        const proId = req.body.id
        const price = parseInt(req.body.price)
        const quantity=1;
        let userData = await userdata.findByIdAndUpdate(userId ,
                    { $push: { wishlist: {proId
                    } } }
        )
        res.json(true)

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const loadWishlist = async (req, res) => {
    try{
        let userSession = req.session.user_id;
        const oid = new mongodb.ObjectId(userSession);
        let data = await userdata.aggregate([
            {$match:{_id:oid}},
            {$unwind:'$wishlist'},
            {$project:{
                proId:{'$toObjectId':'$wishlist.proId'},
            
                // size:'$cart.size'
            }},
            {$lookup:{
                from:'products',
                localField:'proId', 
                foreignField:'_id',
                as:'ProductDetails',
            }},


        ])
  
        res.render('wishlist' , {products:data })
    }catch(err){
        console.log(err)
        res.send("Error")
        }
    }
const removeFromWishlist = async (req, res) => {
    try {
       const userSession = req.session.user_id;
       userdata.updateOne(
           {_id: userSession},
           {$pull: {wishlist: {proId: req.params.id}}
       }).then((status)=>{
           res.redirect('/wishlist')
       }).catch((err)=>{
           console.log(err.message);
        })
    } catch (error) {
     console.log(error.message)  
    }
} 

module.exports = {
    addToCart,
    viewCart,
    updateCartItem,
    removeFromCart,
    addToWishlist,
    loadWishlist,
    removeFromWishlist
}