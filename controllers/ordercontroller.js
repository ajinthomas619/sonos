
const Order = require("../models/ordersmodel");
const User=require('../models/usermodel');
const Product = require("../models/productmodel");
const Category = require("../models/categorymodel");
const Coupon =  require("../models/couponmodel");
const admin = require("../models/adminmodel");;
const Razorpay = require('razorpay');
const moment =require('moment')
const mongoose = require('mongoose');
const config = require("../config/config");
const easyinvoice = require('easyinvoice');



const { ObjectId } = require("mongodb");
const { log } = require("console");




const razorpay = new Razorpay({
  key_id:'rzp_test_Keb8pHjC7as4Sl',
  key_secret:'tOYVSLenYTMsNs7TzD2iLTOL'
});


const loadOrderDetails = async (req, res) => {
    try {
        const userData = await admin.findById(req.session.admin_id);
        const categories = await Category.find();
        const orderId = req.params.id;
        console.log("iddddd", orderId);
        console.log("sdfds", Product);
       let  oid = new mongoose.Types.ObjectId(orderId)
        const user = await User.findById(req.session.user_id);

        const order = await Order.aggregate([
            { $match: { _id: oid } },
            {$unwind:'$products'},
            {$project:{
                proId:{'$toObjectId':'$products.proId'},
                quantity:'$products.quantity',
                address:'$shippingAddress',
                orderedOn:'$createdAt',
                orderStatus:'$orderStatus',
                paymentMethod:'$paymentMethod',
                discount:'$discount',
                totalAmount:'$netTotal'
             }},
            {
                $lookup: {
                    from: 'products',
                    localField: 'proId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            }
        ]);

        console.log("orderrr", order);
        console.log("dsjlfnds===");
        console.log(order[0].productDetails);

        if (!order || order.length === 0) {
            return res.status(404).send('Order not found');
        }

        // Assuming products are in the first element of the order array
        const firstProduct = order[0].productDetails[0];

        if (firstProduct && firstProduct.productname) {
            console.log("First product name:", firstProduct.productname);
        } else {
            console.log("First product not found or missing 'name' property.");
        }

        // ... (remaining code remains unchanged)

        res.render('orderdetail', {
            order: order,
            user: user,
            categories: categories,
            admin: userData
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};


const loadPlaceOrder =async(req,res)=>{
    try{
        const user = await User.findOne({_id:req.session.user_id}).populate("cart.proId");
        const userCart =await User.findOne({_id:req.session.user_id});
        console.log(req.body);
        const categories = await Category.find();
        const coupons=await Coupon.find();
        console.log('codj==',coupons);
        let oid = new mongoose.Types.ObjectId(req.session.user_id)
        let data = await User.aggregate([
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
        console.log("dataaaaa==",data[0].ProductDetails[0])
        let GrandTotal = 0
        for(let i=0;i<data.length;i++){
            let qua = parseInt(data[i].quantity);
            GrandTotal = GrandTotal+(qua*parseInt(data[i].ProductDetails[0].saleprice))
        }
        console.log("Grand total = " , GrandTotal)
        
        res.render('checkout',{
            user:user,
            userCart:userCart,
            categories:categories,
            data:data,
            GrandTotal,
            coupon:coupons
        })
    }
    catch(error){
        console.log(error.message);
    }
}

// const postOrder = async(req,res)=>{
//     try{
//         const userId = req.session.user_id;
//         const userreq = await User.findById(userId,{cart:1,_id:0});
//         const order = new Order({
//             customerId:userId,
//             products:userreq.cart,
//             quantity:req.body.quantity,
//             price:req.body.salePrice,
//             totalAmount:req.body.GrandTotal,
//             paymentMethod:req.body.paymentMethod,
//             shippingAddress:JSON.parse(req.bnody.address),
//         });
//         const orderId = order._id;
//         const orderSuccess = await order.save();
//         if(orderSuccess){
//             for(const cartItem of userreq.cart){
//                 const product =await Product.findById(cartItem.productId);
//                 if(product){
//                     product.stock-= cartItem.quantity;
//                     await product.save();
//                 }
//             }
//             await User.updateOne({_id:userId},{$unset:{cart:1}});
//         }
//     }
//     catch(error){
//         console.log(error.message)
//     }
// }
const orderSuccess = (req, res)=>{
res.render('successPage');
}


const checkout = async(req,res)=>{
    try{
     
     const userId = req.session.user_id;
     const user = await User.findById(userId);

     const cart = await User.findById(req.session.user_id, {cart:1});
    // console.log(cart.cart);
  
    Object.freeze(cart);
     console.log("req n===",req.body);
     let GrandTotal = req.body.total;
     let discountedAmount = 0;

if(req.body.ordercouponname!=''){
    const coupon = await Coupon.findOne({ couponname:req.body.ordercouponname });
    if(coupon){
        if (req.body.total >= coupon.minamount) {
             discountedAmount = req.body.total - (req.body.total * coupon.discount) / 100;
            discountedAmount = Math.min(discountedAmount, coupon.maxdiscount);

             GrandTotal =req.body.total -discountedAmount


            console.log("discounted amount==", discountedAmount);
        }

    }

}





     
     const order=new Order({
        customerId: userId,
        quantity:req.body.quantity,
        price:req.body.salePrice,
        products:cart.cart,
        totalAmount:req.body.total,
        netTotal:GrandTotal,
        discount:discountedAmount,
        shippingAddress: JSON.parse(req.body.address),
        paymentMethod:req.body.payment_method,
     });
     console.log("payment option ===",req.body.payment_method);
     const orderSuccess = await order.save();
  
     console.log("orderrrrr===",order._id);
     const orderId = order._id;
     
     if(orderSuccess){
        for(const cartItem of user.cart){
            const product = await Product.findById(cartItem.proId);
       
            if(product){
                product.quantity -= cartItem.quantity;
                await product.save();
            }
           
            console.log("updated quantity === ",product.quantity);
        }
        user.cart = user.cart.filter(cartItem => {
            return !cart.cart.some(orderItem => orderItem.productId === cartItem.proId);
        });

        await user.save();

        if(req.body.payment_method === 'cod'){
            console.log("before save === ",order)
            await Order.findByIdAndUpdate({_id :orderId},{$set:{orderStatus:'PLACED'}})
            // res.render('successPage')
            res.status(200).send({
                success:true,
                payment_method: req.body.payment_method            
            });

        }
        else if(req.body.payment_method === "online"){
          
            const amount = GrandTotal*100;
            const options = {
                amount:amount,
                currency:"INR",
                receipt:orderId,
            };
        
            razorpay.orders.create(options,(err,order)=>{
                if(!err){
                   console.log("Razorpay order created");
                   // console.log(orderId);
                    res.status(200).send({
                        success:true,
                        payment_method: req.body.payment_method,
                        msg:"Order Created",
                        rpOrder_id:order.id,
                        key_id:'rzp_test_Keb8pHjC7as4Sl',
                        productname:req.body.productname,
                        description:'hi',
                        amount:amount,
                        receipt:orderId,
                        contact:"998555821",
                        name:"kidiloski",
                        email:"kidiloski619@gmail.com"
                    });
                }
                else{
                    console.log('bhhhhhhh');
                    console.error("Razorpay order creation failed: ",err);
                    res.status(400).send({success:false,msg:"Something went wrong!"});
                }
            })
        }
    
        }
    }
    catch(error){
        console.log(error.message);
        res.status(500).send("Internal Server Error")
    }
}

const verifyPayment = async(req,res)=>{
    try {
        console.log("idddddd=",req.body.orderId);
        console.log('idd1===',req.body);
        console.log("iddd2===",req.body.payment);
        const confirm = await Order.find({_id:new mongoose.Types.ObjectId(req.body.orderId)}).lean();
        if(confirm)
        console.log(confirm);
    console.log(req.body.orderId);
    // const crypto = require('crypto');
    // let hmac = crypto.createHmac('sha256','rzp_test_Keb8pHjC7as4');
    // hmac.update(req.body.payment.razorpay_order_id+"|"+req.body,payment.razorpay_payment_id);
    // hmac=hmac.digest('hex');
    const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256', 'tOYVSLenYTMsNs7TzD2iLTOL' );

        hmac.update(req.body.payment.razorpay_order_id + '|' + req.body.payment.razorpay_payment_id);
        hmac = hmac.digest('hex');
        console.log(hmac);
        console.log( req.body.payment.razorpay_signature)
console.log("REACHED THE DESTINATIPON");

     if(hmac == req.body.payment.razorpay_signature){
    //if(true){
        console.log('call comes here');
        console.log(typeof(req.body.orderId));
        await Order.updateOne({_id:new mongoose.Types.ObjectId(req.body.orderId)},{$set:{paymentStatus : 'RECEIVED',orderStatus :"PLACED"}});


        res.status(200).json({status: true, msg:'Payment verified'});

    }
    else{
        res.status(400).json({ status: false , msg: 'Payment verification failed'});
    }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({status:false, msg: 'Internal Server Error'});
    }
}
const cancelOrder = async(req,res)=>{
    try {

        const orderId  =req.params.id;
        let  oid = new mongoose.Types.ObjectId(orderId)
        console.log("iddd candds ==",oid);
        const update = {
            orderStatus : 'CANCELLED'
        }
        const order = await Order.findByIdAndUpdate(oid,update);
        console.log("updated order===",order);
        res.redirect('/account');

    } catch (error) {
        console.log(error.message)
    }
}

const loadOrderList = async(req,res)=>{
    try{
        const pageNumber = parseInt(req.query.page) || 1; 
        const pageSize = 10; 
        const totalOrders = await Order.countDocuments();
        const totalPages = Math.ceil(totalOrders / pageSize);
        const userData = await admin.findById(req.session.admin_id);
        const orderId = req.params.id;
        console.log("iddddd", orderId)
        const orders = await Order.find()
        .sort({createdAt:-1})
        .skip((pageNumber-1)*pageSize)
        .limit(pageSize);
        console.log("order var = ",orders);

   
        console.log("pageNumber:", pageNumber);
        console.log("pageSize:", pageSize);
        console.log("totalPages:", totalPages);
      
        const user = await User.findById(req.session.user_id);
        if (orders.shippingAddress && orders.shippingAddress.name) {
            // Check if shippingAddress exists and has a 'name' property
            console.log(orders.shippingAddress.name);
            console.log(orders.shippingAddress.addressLine1);
            console.log(orders.shippingAddress.city);
            console.log(orders.shippingAddress.state);
        } else {
            console.log("Shipping address is missing or incomplete.");
        }
        res.render('orderlist',{orders:orders,user:user,admin:userData,totalPages: totalPages, currentPage: pageNumber })
    }
    catch(error){
        console.log(error.message)
    }
}


const loadOrderDetail = async (req, res) => {
    try {
        console.log(req.params);
        const userData = await admin.findById(req.session.admin_id);
        const categories = await Category.find();
        const orderId = req.params.id;
        console.log("iddddd", orderId);
        console.log("sdfds", Product);
       let  oid = new mongoose.Types.ObjectId(orderId);
       console.log("oidddd===",oid);
        const user = await User.findById(req.session.user_id);

        const order = await Order.aggregate([
            { $match: { _id: oid } },
            {$unwind:'$products'},
            {$project:{
               
                proId:{'$toObjectId':'$products.proId'},
                quantity:'$products.quantity',
                address:'$shippingAddress',
                orderedOn:'$createdAt',
                orderStatus:'$orderStatus',
                paymentMethod:'$paymentMethod'
             }},
            {
                $lookup: {
                    from: 'products',
                    localField: 'proId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            }
        ]);

        console.log("orderrr", order);
        console.log("proooo=====",order[0].productDetails);
  

        if (!order || order.length === 0) {
            return res.status(404).send('Order not found');
        }

        // Assuming products are in the first element of the order array
        // Assuming products are in the first element of the order array
        const firstProduct = order[0].productDetails[0];

        if (firstProduct && firstProduct.productname) {
            console.log("First product name:", firstProduct.productname);
        } else {
            console.log("First product not found or missing 'name' property.");
        }
        let products = [];
        order[0].productDetails.forEach(product => {
            let item ={
                quantity:product.quantity,
                description: product.productname, 
                price:product.saleprice 
            }
            products.push(item)  
            
        });
        console.log("hdsbcjkd",products);

        // ... (remaining code remains unchanged)

        res.render('orderdetails', {
            order: order,
            user: user,
            categories: categories,
            admin: userData,
            products:products
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};
const printInvoice = async (req, res) => {
    try {
      console.log(req.body);
      const orderId = req.body.orderId;
      const orderData = await Order.findOne({ _id: orderId }).populate(
        "products.proId"
      );
      console.log("de===",orderData);
      console.log(orderData.pro);
  
      const product = orderData.products.map((item, i) => {
        return {
          quantity: parseInt(item.quantity), // Use item.quantity
          description: item.proId.productname, // Use item.productId.productName
          price: parseInt(item.proId.saleprice), // Use item.productId.salePrice
          total: parseInt(item.totalAmount),
          "tax-rate": 0,
        };
      });
  
      console.log("product");
      console.log(product);
      var data = {
        //   "images": {
        //       "logo": "/assets/imgs/theme/logo1.png"
        //  },
        // Your own data
        sender: {
          company: "Sonos",
          address: "rks building, HSR Layout,Banglore",
          zip: "550855",
          city: "Banglore",
          state: "Karnataka",
          country: "India",
        },
        // Your recipient
        client: {
          company: orderData.shippingAddress.name,
          address: orderData.shippingAddress.addressLine1,
          zip: orderData.shippingAddress.pinCode,
          city: orderData.shippingAddress.city,
          state: orderData.shippingAddress.state,
          country: "INDIA",
        },
  
        information: {
          // Invoice number
          number: orderData._id,
          // Invoice data
          date: orderData.createdAt,
          // Invoice due date
          "due-date": orderData.createdAt,
        },
        // The products you would like to see on your invoice
        // Total values are being calculated automatically
        products: product,
        // The message you would like to display on the bottom of your invoice
        "bottom-notice": "Kindly pay your invoice within 15 days.",
        // Settings to customize your invoice
        settings: {
          currency: "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
          // "locale": "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')
          // "margin-top": 25, // Defaults to '25'
          // "margin-right": 25, // Defaults to '25'
          // "margin-left": 25, // Defaults to '25'
          // "margin-bottom": 25, // Defaults to '25'
          // "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
          // "height": "1000px", // allowed units: mm, cm, in, px
          // "width": "500px", // allowed units: mm, cm, in, px
          // "orientation": "landscape", // portrait or landscape, defaults to portrait
        },
      };
  
      console.log("data");
      console.log(data);
  
      res.json(data);
    } catch (error) {
      console.log(error.message);
    }
  };



module.exports={
    loadOrderDetails,
    loadPlaceOrder,
    orderSuccess,   
    checkout,
    verifyPayment,
    cancelOrder,
    loadOrderList,
    loadOrderDetail,
    printInvoice
  
    
}