const mongoose=require('mongoose');
const moment = require('moment-timezone');

const orderData = mongoose.Schema({
    orderId: String,
    customerId: {
        type : mongoose.Schema.Types.ObjectId,
        ref:'userdata'
    },
    // products : [{
    //     productId: {
    //         type : mongoose.Schema.Types.ObjectId,
    //         ref: 'products'
    //     },
    //     quantity: Number,
    //     price: Number,
    //     productname:String
    // }]
    products: [{
        proId: {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'products'


        },
        quantity: Number,
        price: Number,
    }],
    // paymentMethod : String,
    paymentStatus: {
        type : String,
        default: "PENDING"
    },
    paymentMethod:{
        type: Object,
        default : 'PENDING'
    },
    shippingMethod: {
        type : String,
        default: "Post Mail Courier"
    },
    shippingCost: {
        type : Number,
        default: 0
    },
    totalItems : Number,
    totalAmount : Number,   

    discount: {
		type: Number,
		default: 0,
	},
    shippingAddress : {}
    ,
    orderStatus: {
        type : String,
        default: "PENDING"
    },
    createdAt: {
        type: Date,
        default: () => moment.tz(Date.now(), "Asia/Kolkata")
    },
    updatedAt:{
        type: Date,
        default: () => moment.tz(Date.now(), "Asia/Kolkata")
    },
    discount:{
        type:Number

    },
    netTotal:{
        type:Number
    },
    deliveredOn:{
        type: Date
    },
    returnReason:{
        type: String
    }

    
}

)
module.exports = mongoose.model('order',orderData)
