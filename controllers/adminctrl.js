const asyncHandler = require('express-async-handler')
const User = require('../model/userModel')
const Order=require('../model/orderModel')
const Product= require('../model/productModel')
const Category=require('../model/categoryModel')




//load admin dashboard---------------------------------------------------------------

const adminDashboard = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find();
        const orders = await Order.find({status:"delivered"});
        const category=await Category.find()
        const users= await User.find()



        const latestOrders = await Order.find().sort({ createdOn: -1 }).limit(5);
       




        const productCount = products.length;
        const orderCount = orders.length;
        const categoryCount=category.length
      
        const totalRevenue = orders.reduce((total, order) => total + order.totalPrice, 0);
console.log(totalRevenue,"this is total revanut");

          //-------------------this is for the sales graph -----
          const monthlySales = await Order.aggregate([
            {
                $match: {
                    status: "delivered", // Filter by status
                },
            },
            {
                $group: {
                    _id: {
                        $month: '$createdOn',
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    '_id': 1,
                },
            },
        ]);
        const monthlySalesArray = Array.from({ length: 12 }, (_, index) => {
            const monthData = monthlySales.find((item) => item._id === index + 1);
            return monthData ? monthData.count : 0;
        });

        //-------------------this is for the sales graph -end ----

        ///----------this is for the product data------
        const productsPerMonth = Array(12).fill(0);

        // Iterate through each product
        products.forEach(product => {
          // Extract month from the createdAt timestamp
          const creationMonth = product.createdAt.getMonth(); // JavaScript months are 0-indexed
    
          // Increment the count for the corresponding month
          productsPerMonth[creationMonth]++;
        });
        ///----------this is for the product data--end----
        
        res.render('dashboard',{totalRevenue, orderCount, productCount,categoryCount ,monthlySalesArray,productsPerMonth,latestOrders});

    } catch (error) {
        console.log('Error happened in admin controller at adminLoginPage function ', error);
    }
});











//admin login-----------------------------------------------------------------------

const loginAdmin=asyncHandler(async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log("login admin error");
    }
})





//admin verification

const adminVerifyLogin=asyncHandler(async(req,res)=>{
    try {
        const {email, password}=req.body;
        // console.log(email);

        const findAdmin=await User.findOne({email, isAdmin:'1'});
        // console.log('admin data:',findAdmin);
        if(findAdmin && await findAdmin.isPasswordMatched(password)){
            req.session.Admin=true;
            res.redirect('/admin/dashboard');
        }
        else{
            res.redirect('/admin/login');
        }

    } catch (error) {
        console.log(" thi is adminVerify error",error);
        
    }
});


//user page rendering and show details of all users

const userField=asyncHandler(async(req,res)=>{
    try {
       
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4; 
    
        // Calculate the skip value to determine 
        const skip = (page - 1) * limit;
    
        const user = await User.find({isAdmin:{$ne:1}})
            .skip(skip)
            .limit(limit);
            
        // Get the total number of products in the database
        const totalProductsCount = await User.countDocuments();
    
        // Calculate the total number of pages based on the total products and limit
        const totalPages = Math.ceil(totalProductsCount / limit);
        res.render('users',{users:user,page, totalPages ,limit });
        if(blockUser){
            res.redirect('/admin/user');
        }
    } catch (error) {
        console.log("user field error in dashboard",error);
    }
})



//block user

const blockUser=asyncHandler(async(req,res)=>{
    try {
        const id=req.query.id;
        const blockedUser=await User.findByIdAndUpdate(id,{isBlocked:true},{new:true});
        
        if(blockedUser)
        {
            res.redirect('/admin/users');
        }

        } catch (error) {
        console.log("block user error");
    }
})
//unblock user

const unblockUser=asyncHandler(async(req,res)=>{
    try {
        const id=req.query.id;
        const unblockedUser=await User.findByIdAndUpdate(id,{isBlocked:false},{new:true});

        if(unblockedUser)
        {
            res.redirect('/admin/users');
        }
    } catch (error) {
        console.log("unblock user error");
    }
})




//logout admin--------------------------------------------------
const logout = asyncHandler(async (req, res) => {
    try {
        req.session.Admin = null;
        res.redirect('/admin/login')

    } catch (error) {
        console.log('Error hapence in admin conroller at logout function ', error);
    }
})



module.exports={
    adminDashboard,
    loginAdmin,
    adminVerifyLogin,
    userField,
    blockUser,
    unblockUser,
    logout
    
}