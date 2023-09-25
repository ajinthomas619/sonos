const mongoose=require("mongoose");
var id=new mongoose.Types.ObjectId();


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
  
},
cart:{
    type:Array,
},
wishlist:{
    type:Array
},
address:[addressData]


});
module.exports=mongoose.model('userdata',userData)