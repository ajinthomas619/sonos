const mongoose=require("mongoose");
var id=new mongoose.Types.ObjectId();
const moment = require('moment-timezone');

const addressData = new mongoose.Schema({
    name: {
      type: String
    },
    addressLine1: {
      type: String
    },
    addressLine2: {
      type: String
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    pinCode: {
      type: String
    },
    phone: {
      type: String
    },
    email: {
      type: String
    },
    addressType: {
      type: String
    }
  });
  

const userData=mongoose.Schema({
    username:{
        type:String,
        required:true
    },

email:{
    type:String,
    required:true
},
mobile:{
    type:Number,
    required:true
},
password:{
    type:String,
    required:true
},
token:{
    type:String,
    default:' '
},
is_admin:{
    type:Number
},
is_blocked:{
type:Boolean
},
is_active:{
    type:Boolean,
    default:true
  
},
cart:{
    type:Array,
},
wishlist:{
    type:Array
},
address:[addressData],

wallet: [{
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'order'
  },
  transactionType: String,
  amount: Number,
  remarks: String,
  createdOn: {
    type: Date,
    default: () => moment.tz(Date.now(), "Asia/Kolkata")
  }

}]


});
module.exports=mongoose.model('userdata',userData)