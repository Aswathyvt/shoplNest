const express= require("express");
const router=express();
const {loginAdmin, adminDashboard,adminVerifyLogin, userField, blockUser, unblockUser,logout}=require('../controllers/adminctrl');
const { allCategory,addCategory,editCategory, deleteCategory,updateCategory,unlistCategory, listCategory } = require("../controllers/categoryctrl");
const {allProducts,addProduct,createProduct,editProduct,productEdited,unlistProduct,listProduct,deleteProduct,productsSearch,deleteSingleImage}=require("../controllers/productCtrl");
const {adminOrderDetails,changeStatusPending,changeStatusConfirmed,changeStatusShipped,changeStatusCanceled,changeStatusDelivered,changeStatusReturned, adminOrderList,loadsalesReport,salesReport}=require('../controllers/orderCtrl');
const {loadCoupon,addCoupon,coupon,editCoupon,deleteCoupon,updateCoupon}=require('../controllers/couponCtrl')
const{productOfferpage,updateOffer,catogaryOffer,updateCatogaryOffer}=require('../controllers/offerCtrl')


router.set('view engine','ejs'); 
router.set('views','./views/admin');


const {upload}=require('../multer/multer');

const {
    isAdminAuth
}=require('../middleware/adminAuth')




//admin route------------------------------------------------------------------------

router.get('/login',loginAdmin);
router.post('/login',adminVerifyLogin);
router.get('/dashboard',adminDashboard);
router.get('/users',userField);
router.get('/block',blockUser);
router.get('/unblock',unblockUser);
router.get('/logout',logout);


//product route-------------------------------------------------------------------------

router.get('/product',isAdminAuth,allProducts);
router.get('/product/:page',isAdminAuth, allProducts);
router.get('/addProduct',isAdminAuth,addProduct);
router.post('/createProduct',isAdminAuth,upload.array('images', 12),createProduct);
router.get('/editProduct',isAdminAuth,editProduct);
router.post('/productEdited',isAdminAuth,upload.array('images', 12),productEdited);
router.get('/unlistProduct',isAdminAuth,unlistProduct);
router.get('/listProduct',isAdminAuth,listProduct);
router.get('/deleteProduct',isAdminAuth,deleteProduct);
router.get('/deleteSingleImage',isAdminAuth,deleteSingleImage);




//category route--------------------------------------------------------------------------

router.get('/category',isAdminAuth,allCategory)
router.post('/addCategory',isAdminAuth,upload.single('image'),addCategory);
router.get('/editCategory',isAdminAuth,editCategory);
router.post('/updateCategory',isAdminAuth,upload.single('image'),updateCategory);
router.get('/deleteCategory',isAdminAuth,deleteCategory);
router.get('/unlistCategory',isAdminAuth,unlistCategory);
router.get('/listCategory',isAdminAuth,listCategory);



//order route-------------------------------------------------------------------------------

router.get('/adminOrderList',isAdminAuth,adminOrderList);
router.get('/adminOrderDetails',isAdminAuth,adminOrderDetails);
router.get('/changeStatusPending',isAdminAuth,changeStatusPending);
router.get('/changeStatusConfirmed',isAdminAuth,changeStatusConfirmed);
router.get('/changeStatusShipped',isAdminAuth,changeStatusShipped);
router.get('/changeStatusCanceled',isAdminAuth,changeStatusCanceled);
router.get('/changeStatusdelivered',isAdminAuth,changeStatusDelivered);
router.get('/changeStatusReturned',isAdminAuth,changeStatusReturned);

//coupen route------------------------------------------------------------------------------

router.get('/addCoupon',isAdminAuth,isAdminAuth,loadCoupon);
router.post('/addCoupon',isAdminAuth,addCoupon);
router.get('/coupon',isAdminAuth,coupon);
router.get('/editCoupon',isAdminAuth,editCoupon);
router.post('/updateCoupon',isAdminAuth,updateCoupon);
router.get('/deleteCoupon',isAdminAuth,deleteCoupon);

//---------offer------- ---------------------------------------------------------------------
router.get('/productOfferpage',isAdminAuth,productOfferpage)
router.post('/updateOffer',isAdminAuth,updateOffer)
router.get('/catogaryOffer',isAdminAuth,catogaryOffer)
router.post('/updateCatogaryOffer',isAdminAuth,updateCatogaryOffer)

//sales report------------------------------------------------------------------------------

router.get('/loadsalesReport',isAdminAuth,loadsalesReport);
router.get('/salesReport',isAdminAuth,salesReport);

// search---------------------------------------------------------------------------------

router.post('/productsSearch',productsSearch);






module.exports=router;