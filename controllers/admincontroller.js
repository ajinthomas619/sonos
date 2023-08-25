const admin = require("../models/adminmodel");
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
                req.session.user_id = userData._id;
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
        const userData = await admin.findById(req.session.user_id);
        
        res.render('home',{admin:userData});

    } catch (error) {
        console.log(error.message);
    }
}
const logout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/admin');
        
    } catch (error) {
        console.log(error.message)
    }
}
const adminDashboard = async(req,res)=>{
    try{
        const usersData = user.find({is_admin:0})
        res.render('users',{user:usersData})
    }
    catch(error){
        console.log(error.message)
    }
}

module.exports = {
loadLogin,
verifyLogin,
loadDashboard,
logout,
adminDashboard

}