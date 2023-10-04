const mongoose = require('mongoose');



const bannerData = mongoose.Schema({

bannername:{
    type:String,
    required:true
},
description:{
    type : String ,
},
isListed:{
    type:Boolean  ,
    default:true
},
image:{
    type:String,
    required:true
}


     
})
module.exports = mongoose.model('banner',bannerData);



