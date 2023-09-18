
const Order = require("../models/ordersmodel");
const User=require('../models/usermodel');
const Product = require("../models/productmodel");
const Category = require("../models/categorymodel");


const loadOrderDetails =  async(req,res)=>{
    try{
        const categories = await Category.find();
        const orderId = req.params.id;
        const user = await User.findById(req.session.user_id);
        const order =await Order.findOne({_id:orderId}).populate("Product.productId");
        if (!order) {
            // Handle the case where the order is not found
            return res.status(404).send('Order not found');
        }
     console.log("details of 0th product");
     if (order.products.length > 0) {
        console.log(order.products[0].productId);
    }
     console.log("address" + Order.shippingAddress.addressLine1);
     res.render("orderdetails",{
        order:order,
        user:user,
        categories:categories,
     })

    }    
    catch(error){
        console.log(error.message);
        res.status(500).send("Internal Server Error")
    }
}
const loadPlaceOrder =async(req,res)=>{
    try{
        const user = await User.findOne({_id:req.session.user_id}).populate("cart.proId");
        const userCart =await User.findOne({_id:req.session.user_id});
        console.log(req.body);
        const categories = await Category.find();
        res.render('checkout',{
            user:user,
            userCart:userCart,
            categories:categories,
        })
    }
    catch(error){
        console.log(error.message);
    }
}

const postOrder = async(req,res)=>{
    try{
        const userId = req.session.user_id;
        const userreq = await User.findById(userId,{cart:1,_id:0});
        const order = new Order({
            customerId:userId,
            products:userreq.cart,
            quantity:req.body.quantity,
            price:req.body.salePrice,
            totalAmount:req.body.GrandTotal,
            paymentMethod:req.body.paymentMethod,
            shippingAddress:JSON.parse(req.bnody.address),
        });
        const orderId = order._id;
        const orderSuccess = await order.save();
        if(orderSuccess){
            for(const cartItem of userreq.cart){
                const product =await Product.findById(cartItem.productId);
                if(product){
                    product.stock-= cartItem.quantity;
                    await product.save();
                }
            }
            await User.updateOne({_id:userId},{$unset:{cart:1}});
        }
    }
    catch(error){
        console.log(error.message)
    }
}
const checkout = async(req,res)=>{
    try{
     const userId = req.session.user_id;
     const user = await User.findById(userId);
     const cart = await User.findById(req.session.user_id, {cart:1,id:0});
     console.log(cart.cart);
     console.log(req.body);
     const order=new Order({
        customerId: userId,
        quantity:req.body.quantity,
        price:req.body.salePrice,
        products:cart.cart,
        totalAmount:req.body.total,
        shippingAdress:req.body.address,
        paymentDetalis:req.body.payment_option,
     });
     const orderSuccess = await order.save();
     console.log('order==',order);
     console.log(order_id);
     const orderId = order._id;
     console.log(orderSuccess);
     console.log(orderId);
     if(orderSuccess){
        for(const cartItem of user.cart){
            const product = await Product.findById(cartItem.productId);
            if(product){
                product.quantity = cartItem.quantity;
                await product.save();
            }
        }
     }
    }
    catch(error){
        console.log(error.message)
    }
}
module.exports={
    loadOrderDetails,
    loadPlaceOrder,
    postOrder
}