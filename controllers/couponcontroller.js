const Coupon =  require("../models/couponmodel");
const admin = require("../models/adminmodel");





const mongoose = require('mongoose');



const loadAddCoupon = async(req,res)=>{
    try {
        const userData = await admin.findById(req.session.admin_id);
        res.render('addcoupon',{admin:userData})  
    } catch (error) {
        console.log(error.message)
    }
}

const loadCoupon = async(req,res)=>{
    try {
        const userData = await admin.findById(req.session.admin_id);
        const coupons=await Coupon.find();
        // console.log("coupons",coupons[0].code);
        console.log("coupons",coupons);
           res.render('coupons',{admin:userData,coupon:coupons})     
         
    } catch (error) {
        console.log(error.message)
    }
}


const addCoupon = async (req, res) => {
    try {
        const { couponname, discount, minamount, maxdiscount } = req.body;
        
        // Validate minamount and maxdiscount
        if (minamount < 500 || discount > 60 ||  minamount < 0 || discount < 0) {
            return res.status(400).json({ message: 'Invalid minamount or discount value' });
        }

        const coupon = new Coupon({
            couponname: couponname,
            discount: discount,
            minamount: minamount,
            maxdiscount: maxdiscount,
        });

        console.log("coupon===", coupon);

        const couponData = await coupon.save();
        if (couponData) {
            res.redirect('/admin/coupons');
        } else {
            res.status(500).json({ message: 'Coupon not saved' });
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const blockCoupon =async(req,res)=>{
    
    try {
        console.log("bodyyy:===",req.body);
        const id=req.body.id;
        if (id.trim() === "") {
            res.status(400).json({ message: 'Invalid id' });
            return;
        }
        // const userData = await user.find({is_admin:0});
        const userblock =await Coupon.findByIdAndUpdate(id,{$set:{isListed:false}} , {new:true});
        console.log("blockeduser == ",userblock);


        if (userblock.isListed == false) {
            // If nModified is 1, it means the update was successful
            console.log("Coupon blocked successfully");
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


const unblockCoupon =async(req,res)=>{
    
    try {
        console.log("bodyyy:===",req.body);
        const id=req.body.id;
        // const userData = await user.find({is_admin:0});
        const userunblock =await Coupon.findByIdAndUpdate(id,{$set:{isListed:true}} , {new:true});
        console.log("blockeduser == ",userunblock);


        if (userunblock.isListed == true) {
            // If nModified is 1, it means the update was successful
            console.log("User unblocked successfully");
            res.status(200).json({ message: "User  unblocked successfully" });
        } else {
            // If nModified is not 1, it means no user was updated (possibly due to not found)
            console.log("User not found or not updated");
            res.status(404).json({ message: "User not found or not updated" });
        }
    }
    catch(error){
        console.log(error.message);

    }
}


const applyCoupon = async (req, res) => {
    try {
        let { couponname, totalAmount } = req.body;
        console.log("coupon body ====", req.body);
        const coupon = await Coupon.findOne({ couponname });
        console.log('coupon====', coupon);
        totalAmount = parseFloat(totalAmount);
        console.log("amt===", totalAmount);

        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        console.log("Total Amount:", totalAmount);
        console.log("Coupon Min Amount:", coupon.minamount);
        console.log("Is totalAmount >= minamount?", totalAmount >= coupon.minamount);

        if (totalAmount >= coupon.minamount) {
            let discountedAmount =(totalAmount * coupon.discount) / 100;
            discountedAmount = Math.min(discountedAmount, coupon.maxdiscount);
            discountedAmount = Math.max(discountedAmount, 0); // Ensure discountedAmount is not negative

            const GrandTotal = totalAmount - discountedAmount;

            console.log("discounted amount==", discountedAmount);
            res.status(200).json({ success: true, discountedAmount, GrandTotal });
        } else {
            // If the totalAmount is less than the minimum amount required for the coupon
            res.status(400).json({ error: 'Total amount does not meet the minimum requirement for this coupon' });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
};


  
        





module.exports={
    loadAddCoupon,
    addCoupon,
    loadCoupon,
  
    blockCoupon,
    unblockCoupon,

    applyCoupon,
   
}
