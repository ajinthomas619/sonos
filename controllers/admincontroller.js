const admin = require("../models/adminmodel");
const user = require("../models/usermodel");
const bcrypt = require('bcrypt');

const config = require("../config/config");


const loadLogin = async(req,res)=>{
    try{
        res.render('login')
    }
    catch(error){
        console.log(error.message)
    }
}

const verifyLogin = async(req,res)=>{
    console.log(req.body)
    try {
        const email =req.body.email;
        const password = req.body.password;

       const userData = await admin.findOne({email:email});
       if(userData){
        const passwordMatch =  await bcrypt.compare(password,userData.password);
        if(passwordMatch){
            if(userData.is_admin == 1){
                req.session.admin_id = userData._id;
                res.redirect("/admin/home");
               
            }
            else{
                res.render('login',{message:"Email and password is incorrect"})
            }

        }
        else{
            res.render('login',{message:"Email and password is incorrect"}) 
        }


       }
       else{
        res.render('login',{message:"Email and password is incorrect"})
       }


    } catch (error) {
        console.log(error.message)
    }
}
const loadDashboard =async(req,res)=>{
    try {
        const userData = await admin.findById(req.session.admin_id);
        
        res.render('home',{admin:userData});

    } catch (error) {
        console.log(error.message);
    }
}
const logout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/admin/login');
        
    } catch (error) {
        console.log(error.message)
    }
}
const adminDashboard = async(req,res)=>{
    try{
        const usersData = await user.find({is_admin:0})
        console.log(usersData.length);
        res.render('users',{users:usersData})
    }
    catch(error){
        console.log(error.message)
    }
}
const blockuser =async(req,res)=>{
    
    try {
        console.log("bodyyy:===",req.body);
        const id=req.body.id;
        // const userData = await user.find({is_admin:0});
        const userblock =await user.findByIdAndUpdate(id,{$set:{is_active:false}} , {new:true});
        console.log("blockeduser == ",userblock);


        if (userblock.is_active == false) {
            // If nModified is 1, it means the update was successful
            console.log("User blocked successfully");
            res.status(200).json({ message: "User blocked successfully" });
        } else {
            // If nModified is not 1, it means no user was updated (possibly due to not found)
            console.log("User not found or not updated");
            res.status(404).json({ message: "User not found or not updated" });
        }

        
       



    } catch (error) {
        console.log(error.message);
    }
}


const unblockuser =async(req,res)=>{
    
    try {
        console.log("bodyyy:===",req.body);
        const id=req.body.id;
        // const userData = await user.find({is_admin:0});
        const userunblock =await user.findByIdAndUpdate(id,{$set:{is_active:true}} , {new:true});
        console.log("blockeduser == ",userunblock);


        if (userunblock.is_active == true) {
            // If nModified is 1, it means the update was successful
            console.log("User unblocked successfully");
            res.status(200).json({ message: "User  unblocked successfully" });
        } else {
            // If nModified is not 1, it means no user was updated (possibly due to not found)
            console.log("User not found or not updated");
            res.status(404).json({ message: "User not found or not updated" });
        }

        
       



    } catch (error) {
        console.log(error.message);
    }
}




module.exports = {
loadLogin,
verifyLogin,
loadDashboard,
logout,
adminDashboard,
blockuser,
unblockuser

}