const mongoose=require("mongoose");
var id=new mongoose.Types.ObjectId();
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
cart:{
    type:Array,
},


});
module.exports=mongoose.model('userdata',userData)