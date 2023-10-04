const mongoose = require('mongoose');
var id = new mongoose.Types.ObjectId();
const couponSchema=mongoose.Schema({
    couponname:{
        type:String,
        required:true,
        unique:true
    },
    discount:{
        type:String,
        required:true
    },
    minamount:{
        type:Number,
        required:true
    },
    maxdiscount:{
        type:Number,
        required:true

    },
    isListed:{
        type:Boolean,
       default:true
    }

});
const Coupon = mongoose.model('coupon',couponSchema);
module.exports = Coupon
