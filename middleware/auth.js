
const user = require('../models/usermodel');


const isLogin = async(req,res,next)=>{
try{
if(req.session.user_id){
    
    const userData = await user.findById(req.session.user_id);
    if(userData.is_active == "false"){
        req.session.destroy();
    }
   
    next();
}
else{
    res.redirect('/login');
}


}
catch(error){
    console.log(error.message)
}
}


const isLogout = async(req,res,next)=>{
    try{
        if(req.session.user_id){
            res.redirect('/')
        
        }else{
            next()
        }

    }
    catch(error){
        console.log(error.message)
    }
    
    }

module.exports={
    isLogin,
    isLogout
}