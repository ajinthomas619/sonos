const mongoose = require("mongoose");
var id=new mongoose.Types.ObjectId();
const categorySchema = new mongoose.Schema({

    categoryname: {
        type: String,
        required:true,
        unique:true
        

       
    },
    description: {
        type: String
    },
    isListed: {
        type: Boolean,
        required: true,
        default: false
    },
    image: {
        type: String
    },
    
})

    
module.exports = mongoose.model('Category',categorySchema)