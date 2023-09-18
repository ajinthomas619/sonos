const mongoose=require('mongoose');
const orderData = mongoose.Schema({
    orderId: String,
    customerId: {
        type : mongoose.Schema.Types.ObjectId,
        ref:'userdata'
    },
    products : [{
        productId: {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'products'
        },
        quantity: Number,
        price: Number,
    }],
    // paymentMethod : String,
    paymentStatus: {
        type : String,
        default: "PENDING"
    },
    paymentMethod:{
        type: Object,
        default : 'COD'
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
    shippingAddress : {},
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
    }
}

)
module.exports = mongoose.model('order',orderData)
