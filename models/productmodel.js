const mongoose=require("mongoose");
var id=new mongoose.Types.ObjectId();
const productSchema=mongoose.Schema({
    productname:{
        type:String,
        required:true
    },

description:{
    type:String,
},
category:{
    type:String,
    required:true
},
Quantity:{
    type:Number,
    required:true
},
regularprice:{
    type:Number,
    required:true
},
saleprice:{
    type:Number,
    required:true
},
image:{
type:String
}


});
module.exports=mongoose.model('products',productSchema)