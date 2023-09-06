const Product = require("../models/productmodel");
const userdata = require('../models/usermodel');
const mongoose = require('mongoose');
const { ObjectId } = require("mongodb");



const addToCart = async (req, res) => {
    try {
        const userId = req.session.user_id
        const proId = req.body.id
        const price = parseInt(req.body.price)
        const quantity=1;
        let userData = await userdata.findByIdAndUpdate(userId ,
            {
                $push:{'cart':{proId,price,quantity}}
            })
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
    try {
        const items=[]
        
            const userCart = await userdata.findOne({_id: req.session.user_id})
            res.render('Cart',{userCart: userCart,products:items})
    }
         catch (error) {
            console.log(error.message);
        }
      }

const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        const userId = req.user._id;
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const cartItem = cart.items.find((item) => item.product.equals(productId));
        if (!cartItem) {
            return res.status(404).json({ message: 'Item not found in cart ' })
        }
        cartItem.quantity = parseInt(quantity, 10);
        cart.total = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
        await cart.save();
        res.status(200).json({ message: 'Cart item updated successfully' })

    }
    catch (error) {
        res.status(500).json({ error: 'not updated' })
    }
}
const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' })
        }
        const updatedItems = cart.items.filter((item) => !item.product.equals(productId));
        cart.total = updatedItems.reduce((total, item) => total + item.price * item.quantity, 0);
        cart.items = updatedItems;
        await cart.save();
        res.status(200).json({ message: 'Product removed from cart successfully', cart })
    }
    catch (error) {
        console.log(error)
    }
}
module.exports = {
    addToCart,
    viewCart,
    updateCartItem,
    removeFromCart
}