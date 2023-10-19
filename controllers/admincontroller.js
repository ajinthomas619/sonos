const admin = require("../models/adminmodel");
const user = require("../models/usermodel");
const Order = require("../models/ordersmodel");
const Product = require("../models/productmodel");
const Category = require("../models/categorymodel");
const bcrypt = require('bcrypt');

const config = require("../config/config");
const doc = require("pdfkit");


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
        const revenue = await Order.aggregate([
            {
                $group:{
                    _id:null,
                    totalAmount:{$sum:"$totalAmount"},
                },
            },
        ]);
        const totalRevenue = revenue[0].totalAmount.toLocaleString("en-IN");
        const orderCount = await Order.count();
        const productCount = await Product.count();
        const categoryCount = await Category.count();
        const userCount =await user.count();

        const monthlyRevenue = await Order.aggregate([
            {
                $match:{
                    createdAt:{
                        $gte:new Date(new Date().getFullYear(),new Date().getMonth(),1),
                        $lt:new Date(
                            new Date().getFullYear(), 
                            new Date().getMonth() + 1 ,
                             1 ),
                        
                    },
                },
            },
    
            {
                $group:{
                        _id:null,
                        total:{$sum :"$totalAmount"}

                },
            },
        
    ]);
     const mRevenue = monthlyRevenue[0].total.toLocaleString("en-IN") ;
     
     const monthlySales =await Order.aggregate([
        {
            $project:{
               year:{$year:"$createdAt"},
               month:{$month:"$createdAt"},
            },
        },
        {
            $group:{
                _id:{year:"$year",month:"$month"},
                totalOrders:{$sum:1},
            },
        },
        {
            $sort:{
                "_id.year":1,
                "_id.month":1,
            },
        },
     ])
     

     const graphDataSales=[];
     for (let month=1;month<=12;month++){
        const resultForMonth = monthlySales.find(
            (result) => result._id.month === month
        );
        if(resultForMonth){
            graphDataSales.push(resultForMonth.totalOrders)
        }
        else{
            graphDataSales.push(0);
        }
     }
     console.log(("formattefd res====",graphDataSales));

     const productCountData = await Product.aggregate([
        {
            $group:{
               _id:"$category",
               count:{$sum:1}, 
            },
        },
     ]);
     const categoryNames = productCountData.map((item) => item._id);
     const categoryCounts = productCountData.map((item)=>item.count) ;
  


        
        
        res.render('home',
        {admin:userData,
            totalRevenue: totalRevenue,
            orderCount:orderCount,
            productCount:productCount,
            categoryCount:categoryCount,
            monthlyRevenue:mRevenue,
            graphDataSales:graphDataSales,
            categoryCounts:categoryCount,
            categoryNames:categoryNames,
            userCount:userCount,
        
        });

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
        const adminData = await admin.findById(req.session.admin_id);
        const usersData = await user.find({is_admin:0})
        console.log(usersData.length);
        res.render('users',{users:usersData,admin:adminData})
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

const generateReport = async(req,res)=>{
    try{
    let orders = await Order.find().populate('products.proId');
    const PDFDOcument =  require('pdfkit');
    const doc = new PDFDOcument({size:'letter',margin:50});
    doc.pipe(res);
    doc.fontSize(20).text('Sales Report',{align:'center'});
    doc.moveDown();

    const headers = [
        'Index',
        'Date',
        'Order Id',
        'Quantity',
        'Total',
        'Discount',
        
    ];
    const colWidths = [35,90,170,50,70,70,70];
    const rowHeight = 40;
    const cellPadding = (rowHeight-12)/2;
    let x =50;
    let y = doc.y;
    headers.forEach((header,index)=>{
        doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text(header, x,y+cellPadding,{width:colWidths[index],align:'center'});
        x+=colWidths[index];
    });
    let currentPageY = y+rowHeight;
    orders.forEach((order,index)=>{
        const total = order.totalAmount;
        const discount = order.discount || 0;
        const orderId = order._id;
        const date = String(order.createdAt).slice(4,16);
        
        order.products.forEach((product)=>{
            const quantity = product.quantity;
            const finalPrice = total - discount;

            const rowData = [
                index+1,
                date,
                orderId,
                quantity,
                finalPrice
            ];
            console.log(rowData);
            x=50;
            currentPageY += rowHeight;
            if(currentPageY + rowHeight > doc.page.height-50){
                doc.addPage();
                currentPageY = 50;

        }
        rowData.forEach((value,index)=>{
            doc.font('Helvetica').fontSize(12).text(value.toString(),x,currentPageY+cellPadding,{
                width:colWidths[index] , align : 'center'} );
                doc.rect(x,currentPageY,colWidths[index],rowHeight).stroke();
                x +=colWidths[index];
            });
        });
        
      } );
      doc.end();
    }
    catch(error){
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
unblockuser,
generateReport

}