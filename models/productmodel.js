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
  //  type: mongoose.Schema.Types.ObjectId,
  //ref:'Category',
  required:true
    
},
quantity:{
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
image:[{
type:Array
}],

brand:{
    type:String
}



});
module.exports=mongoose.model('products',productSchema)

// const products = [
//     { id: 1, name: 'Product 1', price: 10 },
//     { id: 2, name: 'Product 2', price: 20 },
//     // Add more products as needed
//   ];
  
//   module.exports = {
//     getAllProducts: () => products,
//     getProductById: (id) => products.find((product) => product.id === id),
//   };
  