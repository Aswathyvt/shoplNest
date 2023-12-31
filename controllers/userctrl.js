const User=require("../model/userModel");
const asyncHandler=require("express-async-handler");
const Product = require("../model/productModel");
const nodemailer=require("nodemailer");
const categoryModel = require("../model/categoryModel");
const Order=require("../model/orderModel");


//load index-------------------------------------------------------------------------

const loadIndex = asyncHandler(async (req, res) => {
    try {
        const userId = req.session.user;
        const product = await Product.find({isDeleted:false,status:true});

const user= await User.findById(userId)

       
        const category=await categoryModel.find({status:false})
       
        
        res.render("index", { user, product });
    } catch (error) {
        console.log("Error happens in userController loadIndex function:", error);
    }
});



const registerUser=async(req,res)=>{
    try {
        res.render('registration');
    } catch (error) {
        console.log(error.message);
    }
}
// Function to generate OTP

function generateotp(){

    var digits='1234567890';
    var otp=""
    for(let i=0;i<6;i++){
        otp+=digits[Math.floor(Math.random()*10)];
    }
     // Set OTP expiration time (in seconds)
     const otpExpirationSeconds = 30;
     const expirationTime = new Date();
     expirationTime.setSeconds(expirationTime.getSeconds() + otpExpirationSeconds);
 
     return { otp, expirationTime };


}

//email otp verification-----------------------------------------------------------------------


const createUser=asyncHandler(async(req,res)=>{
    try {
     const email=req.body.email;
     console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++=",req.body);
     const findUser=await User.findOne({email:email});
     if(!findUser){
         //create a new user
        const otp=generateotp();
        console.log("-----------------------------------------------------",otp);
        const transporter=nodemailer.createTransport({
         service:"gmail",
         port:587,
         secure:false,
         requireTLS:true,
         auth:{
             user:process.env.AUTH_EMAIL,
             pass:process.env.AUTH_PASS
         },
        });
        const info=await transporter.sendMail({
         from:process.env.AUTH_EMAIL,
         to:email,
         subject:"Verify Your Account",
         text:`your OTP is :${otp}`,
         html:`<b> <h4> Your OTP ${otp}</h4>  <br> <a href="/emailOTP/">Click here</a></b>`,
        });
        if(info){
         req.session.userOTP=otp;
         console.log("this is the session otp",req.session.userOTP);
 
         req.session.userData=req.body;
         console.log('iama here at session');
         console.log('this is user data',req.session.userData);
         console.log('this is req.body  data',req.session.userData);
 
 
         res.render("emailOTP",{email:req.body.email})
         console.log("Message sent: %s",info.messageId);
        } 
        else{
         res.json("email error")
        }   
     }
     else{
         //user already exist
         res.render('registration',{errMessage:'User already exist',message:''});
 
     }
    } catch (error) {
     console.log("Create user error",error.message);
     
    }
 });

const resendOtp = asyncHandler(async(req, res) => {
    try {
        const email = req.body.email;
        
        
        
        if (!email) {
            return res.json({ success: false, message: 'Email is required.' });
        }
        
        const findUser = await User.findOne({ email: email });

        if (!findUser) {
            const { otp, expirationTime } = generateotp();
            const transporter = nodemailer.createTransport({
                service: "gmail",
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: process.env.AUTH_EMAIL,
                    pass: process.env.AUTH_PASS
                },
            });

            const info = await transporter.sendMail({
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: "Resend Verification OTP",
                text: `Your OTP is :${otp}`,
                html: `<b><h4>Your OTP is ${otp}</h4><br><a href="/emailOTP/">Click here</a></b>`,
            });

            if (info) {
                req.session.userOTP = otp;
                req.session.otpExpirationTime = expirationTime;
                
               console.log("Entered otp----------------------------------------",otp);
                res.json({ success: true, message: "Email " });
            } else {
                res.json({ success: false, message: "Email error" });
            }

        } else {
            res.json({ success: false, message: "Email is already verified." });
        }
    } catch (error) {
        console.log("error in resend otp function", error);
        return res.json({ success: false, message: 'Internal server error.' });
    }
});
//user login-----------------------------------------------------------------------

const loginUser=async(req,res)=>{
  try {
    res.render('login',{message:""});
  } catch (error) {
    console.log("login user error");
  }
}





//user login verification-------------------------------------------------------------



const verifyUser=asyncHandler(async(req,res)=>{
    
        try {
            const { email, password } = req.body;
            const findUser = await User.findOne({ email });
            if(findUser.isBlocked)
            {
                res.render('login',{message:'User has been blocked by admin'})
            }
            else if (findUser && (await findUser.isPasswordMatched(password))) {
                req.session.user = findUser._id;
                console.log('Successfull login');
                res.redirect("/");
            } else {
                console.log('this is else');

                console.log('error in login userr');
                res.redirect("/login",{message: 'Invalid email or password'});
            }
        } catch (error) {
            console.log("Error hapents in userControler userLogin function :", error);
            res.json({ mes: "errorr in user loging cactch" });
        }
})




//user otp chcking--------------------------------------------------------------------

const emailVerified=async(req,res)=>{
    try {
        // const{first,second,third,fourth,fifth,sixth}=req.body
         
        console.log('req.body of email ::::');
        console.log(req.body.otp);
        // const enteredOTP=first+second+third+fourth+fifth+sixth;
       
        const { otp } = req.body;
        const enteredOTP = otp;
        const { userOTP, otpExpirationTime } = req.session;

console.log('this is the enterd otp',enteredOTP);
console.log('this is the session otp',req.session.userOTP);

// Check if OTP is expired
        
if (enteredOTP === userOTP && new Date() < new Date(otpExpirationTime)) {
            const user = req.session.userData;
            console.log(user,"this is user data");
            const saveUserData = new User({
                username: user.username,
                email: user.email,
                mobile: user.mobile,
                password: user.password,
            });
           const users= await saveUserData.save();
             req.session.user = users._id
            console.log('this is saved user data>>>>>>>>>>>>>>>>>>>>>>',users);
            
           res.redirect("/");
        
        }
        else{
            console.log('OTP expired or invalid');
            res.render('emailOTP',{message:'Invalid otp or otp expired'});

        
        }

        
    
    } catch (error) {
        console.log("user email verification error",error);
        
    }
};






const logout = asyncHandler(async (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) throw err;
            res.redirect('/');
        });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).send('Internal Server Error');
    }
});





//user Profile creation-----------------------------------------------------------

const userProfile=asyncHandler(async(req,res)=>{
    try {
        const userId=req.session.user;
        const user=await User.findById(userId);
        const order = await Order.find({ userId: userId }).sort({ date: -1 });

        console.log(user);
        res.render('userProfile',{user,order});
        
    } catch (error) {
        console.log("user controller userProfile error",error);
    }



})



//edit profile---------------------------------------------------------------------------
const editProfile=asyncHandler(async(req,res)=>{
    try {
        const userId=req.query.id;
        const user=await User.findById(userId);
        

        res.render('editProfile',{user});

    } catch (error) {
        console.log("error in user editProfile function");
    }
});



//update user profile---------------------------------------------------------------


const updateProfile=asyncHandler(async(req,res)=>{
    try {
        const {id,username,email,mobile}=req.body;
        const user=await User.findById(id);
        const similarUser=await User.find({$and:
            [{_id:{$ne:user._id}},
                {$or:[{username},{email}]}
            ]});

        if(similarUser.length==0)
        {
            user.username=username;
            user.email=email;
            user.mobile=mobile;
            await user.save();
            res.redirect('/profile');
        }    
        else{
            console.log("user already exist");
        }

    } catch (error) {
        console.log("error in upadate user function",error);
    }
});



//add user profile picture--------------------------------------------------------------
const addProfilePic = asyncHandler(async (req, res) => {
    try {
        const { id } = req.body;
        console.log(id);

        // Validate the existence of id and file.
        if (!id || !req.file) {
            return res.status(400).send({ message: 'ID or file is missing.' });
        }

        const image = req.file.filename;
        const user = await User.findByIdAndUpdate(
            id,
            {
                image: image,
            },
            { new: true }
        );
        // Optionally, check if the user exists before updating
        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        res.redirect('/profile');
    } catch (error) {
        console.error("Error in addProfilePic function:", error);
        res.status(500).send({ message: 'Internal server error.' });
    }
});


//add address---------------------------------------------------------------------------

const addUserAddress=asyncHandler(async(req,res)=>{
    try {
        const {fullName,mobile,region,pinCode,addressLine,areaStreet,ladmark,townCity,state,addressType}=req.body;
        const userId=req.session.user;
        const user=await User.findById(userId);
        const newUserAddress={ fullName,mobile,region,pinCode,addressLine,areaStreet,ladmark,townCity,state,addressType,main: false};
        if (user.address.length === 0) {
            newUserAddress.main = true;
        }
        user.address.push(newUserAddress);
        await user.save();
        res.redirect("/profile");

    } catch (error) {
        console.log("error in addUserAddress function",error);
    }
});


//edit address---------------------------------------------------------------------

const editAddress=asyncHandler(async(req,res)=>{
    try {
        const id=req.query.id;
        const userId=req.session.user;
        const user=await User.findById(userId);
        const address=user.address.id(id);
        res.render('editAddress',{address});

    } catch (error) {
        
    }
})



//update address------------------------------------------------------------------------

const updateAddress=asyncHandler(async(req,res)=>{
    try {
        const userId=req.session.user;
        const {fullName,mobile,region,pinCode,addressLine,areaStreet,ladmark,townCity,state,addressType,id} = req.body;
        const user=await User.findById(userId);
        if(user)
        {
            const oldAddress=user.address.id(id);
            if(oldAddress){
                oldAddress.fullName=fullName;
                oldAddress.mobile=mobile;
                oldAddress.region=region;
                oldAddress.pinCode=pinCode;
                oldAddress.addressLine=addressLine;
                oldAddress.areaStreet=areaStreet;
                oldAddress.ladmark=ladmark;
                oldAddress.townCity=townCity;
                oldAddress.state=state;
                oldAddress.addressType=addressType;
                await user.save();
                res.redirect('/profile');
                }
                else{
                    console.log("address not found");
                }
         }
        
        
        
    } catch (error) {
        console.log("error in update address function",error);
    }
})



//delete address---------------------------------------------------------

const deleteAddress=asyncHandler(async(req,res)=>{
    try {
        const id=req.query.id;
        const userId=req.session.user;
        const user=await User.findById(userId);
        const deleteAddress = await User.findOneAndUpdate(
            { _id: userId },
            {
                $pull: { address: { _id: id } },
            },
            { new: true }
        );;
        console.log("this is the deleted address",deleteAddress);
        res.redirect('/profile');


    } catch (error) {
        console.log("error in deleteAddress function",error);
    }
})





module.exports={  
    loginUser,
    verifyUser,
    registerUser,
    createUser,
    loadIndex,
    emailVerified,
    logout,
    userProfile,
    addProfilePic,
    editProfile,
    updateProfile,
    addUserAddress,
    editAddress,
    updateAddress,
    deleteAddress,
    resendOtp

}  
