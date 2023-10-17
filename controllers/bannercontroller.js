const banner = require("../models/bannermodel");
const admin = require("../models/adminmodel");

const { ObjectId } = require("mongodb");

const mongoose =require('mongoose');


const loadAddBanner = async(req,res)=>{
    try {
        const userData = await admin.findById(req.session.admin_id);
        res.render('addbanner',{admin:userData})
        
    } catch (error) {
        console.log(error.message) 
    }
}

const loadBanner = async(req,res)=>{
    try{
    const userData = await admin.findById(req.session.admin_id);
    const banners =await banner.find();
  
    res.render('banners',{admin:userData,banner:banners});
    }
    catch(error){
        console.log(error.message);
    }
    
}

const addBanner = async(req,res)=>{
    try {
        const image = req.file.filename
        const bannerdata=new banner({
            bannername:req.body.bannername,
            description:req.body.description,
            image:image


        }) 
        const bannerschema = await bannerdata.save();
     
        if(bannerschema){
            res.redirect('/admin/banners')
        }
        else{
            res.status(500).json({message:'banner not found'})
        }


    } catch (error) {
        console.log(error.message)
    }
}
const deleteBanner =async(req,res)=>{
    try{
      
    const id = req.params.id;
    console.log(id);
    await banner.findByIdAndDelete({_id:new ObjectId(id.trim())});
    res.redirect('/admin/banners')
    }
    catch(error){
        console.log(error.message)
    }
}





module.exports = {
    loadAddBanner,

    addBanner,
    loadBanner,
    deleteBanner

}