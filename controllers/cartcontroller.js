const Product = require("../models/productmodel");
const userdata = require('../models/usermodel');
const Coupon =  require("../models/couponmodel");
const mongoose = require('mongoose');
const { ObjectId } = require("mongodb");
const mongodb = require('mongodb')

const addToCart = async (req, res) => {
    try {
        // Extracting data from the request body and session
        const userId = req.session.user_id;
        const proId = req.body.id;
        const price = parseInt(req.body.price);
        const quantity = 1;

        // Fetching user data
        let userData = await userdata.findById(userId);

        // Checking if the product already exists in the user's cart
        const existingItem = userData.cart.find(item => item.proId === proId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            // If the product doesn't exist in the cart, add it
            userData.cart.push({
                proId: proId,
                price: price,
                quantity: quantity
            });
        }
        userData.markModified('cart');
        // Saving the updated user data
        await userData.save();

        // Sending a JSON response
        res.json(true);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



const viewCart = async (req, res) => {
    try {
        // Extracting user session ID and retrieving cart items from the database
        let userSession = req.session.user_id;
        const oid = new mongodb.ObjectId(userSession);
        const coupons = await Coupon.find();
        let data = await userdata.aggregate([
            // Aggregating user data and cart items from the database
            { $match: { _id: oid } },
            { $unwind: '$cart' },
            {
                $project: {
                    proId: { $toObjectId: '$cart.proId' },
                    quantity: '$cart.quantity',
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'proId',
                    foreignField: '_id',
                    as: 'ProductDetails',
                },
            },
        ]);

        // Calculating the Grand Total by iterating through cart items and product prices
        let GrandTotal = 0;
        for (let i = 0; i < data.length; i++) {
            let qua = parseInt(data[i].quantity);
            GrandTotal = GrandTotal + qua * parseInt(data[i].ProductDetails[0].sale_price);
        }

        // Rendering the cart page with cart items, user data, coupons, and Grand Total
        res.render('cart', { products: data, user: data, coupon: coupons, GrandTotal });
    } catch (err) {
        console.log(err);
        res.send('Error');
    }
};


// const updateCartItem = async (req, res) => {
//     try {
//         const userId = req.session.user_id;
//         const proIdToUpdate = req.body.id;
//         const newQuantity = parseInt(req.body.quantity);

//         // Find the user by ID
//         const user = await userdata.findById(userId);

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Find the cart item with the matching product ID
//         const cartItem = user.cart.find((item) => item.proId === proIdToUpdate);

//         if (!cartItem) {
//             return res.status(404).json({ message: 'Product not found in cart' });
//         }

//         // Update the quantity of the cart item
//         cartItem.quantity = newQuantity;

//         // Save the updated user document
//         await user.save();

//         res.status(200).json({ message: 'Cart updated successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal server error' });
//     }

// }
const changeQuantity = async (req, res) => {
    const userId = req.session.user_id;
    req.body.count = parseInt(req.body.count);
    req.body.quantity = parseInt(req.body.quantity);
    const proId = req.body.proId;

    const user = await userdata.findOne({ _id: userId });

    const existingProduct = user.cart.find(product => product.proId === proId);
    
    if (existingProduct) {
        // Product is already in the cart, update quantity
        const updatedQuantity = Math.max(existingProduct.quantity + req.body.count, 1); // Ensure quantity doesn't go below 1

        await userdata.updateOne(
            { _id: userId, 'cart.proId': proId },
            { $set: { 'cart.$.quantity': updatedQuantity } }
        );
        
        console.log("Count updated ===>", updatedQuantity);
        res.json({ status: false });
    } else if (req.body.count !== -1 || req.body.quantity !== 1) {
        // Product is not in the cart, add it with the specified quantity
        await userdata.updateOne(
            { _id: userId },
            { $push: { cart: { proId: proId, quantity: Math.max(req.body.quantity, 1) } } }
        );

        console.log("Product added to cart ===>", proId);
        res.json({ status: false });
    } else {
        // Product is not in the cart, and quantity is already 1, do nothing or handle the case as needed
        console.log("Product not in cart or quantity is already 1");
        res.json({ status: true });
    }
};



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

        const user = await userdata.findById(userId);
        if (user.wishlist.some(item => item.proId === proId)) {
            // Product is already in the wishlist, send a response to the client
            return res.status(400).json({ error: 'Product already in the wishlist' });
        }

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
        const user = await userdata.find()
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
  
        res.render('wishlist' , {products:data,user:user })
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
      changeQuantity,
    removeFromCart,
    addToWishlist,
    loadWishlist,
    removeFromWishlist
}