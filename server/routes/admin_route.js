require('dotenv').config();

var express = require('express')
var admin_route = express();
admin_route.set('views','./views/admin')
const adminController = require("../controller/adminController")
const auth = require("../../middleware/adminAuth.js")
const productController = require("../controller/productController")
const store = require("../../middleware/multer");
const orderController = require("../controller/orderController")
const bannerController = require("../controller/bannerController")
const couponController = require("../controller/couponController")
const dashboardController = require("../controller/dashboardController")


const {isLogin,isLogout} = auth



admin_route.get('/admin_sign_in',isLogout, adminController.adminSignin)
admin_route.post('/admin_signin_post',isLogout,adminController.adminSigninPost)
admin_route.get('/admin_dashboard',isLogin, dashboardController.adminDashboard)
admin_route.get('/chartData', dashboardController.chartData)
admin_route.get('/getSales', dashboardController.getSales)
admin_route.post('/downloadSalesReport', dashboardController.downloadSalesReport)



admin_route.get('/viewOrders',isLogin,adminController.viewOrders)
admin_route.get('/orderDetails',isLogin,orderController.orderDetails)
admin_route.post('/updateOrder',isLogin, orderController.updateOrder)

admin_route.get('/customers',isLogin,adminController.viewCustomers)
admin_route.post("/blockUser",isLogin, adminController.blockUser);
admin_route.post("/unblockUser",isLogin, adminController.unblockUser);


admin_route.get('/add_product',isLogin,productController.addProduct)
admin_route.post('/add_product_post',store.array("product_image",4),isLogin,productController.addProductPost)
admin_route.get('/view_products',isLogin,productController.viewProducts)
admin_route.get('/delete_product/:id',isLogin,productController.deleteProduct)
admin_route.get('/update_product/:id',isLogin,productController.updateProduct)
admin_route.post('/update_product_post/:id',isLogin,store.array("product_image",4),productController.updateProductPost)


admin_route.get('/addCategory',isLogin,productController.addCategory)
admin_route.post('/addCategory',store.single("category_image"),isLogin,productController.addCategoryPost)
admin_route.get('/viewCategory',isLogin,productController.viewCategory)
admin_route.get('/updateCategory/:id',isLogin,productController.updateCategory)
admin_route.post('/updateCategoryPost/:id',store.single("category_image"),isLogin,productController.updateCategoryPost)
admin_route.get('/deleteCategory/:id',isLogin,productController.deleteCategory)


admin_route.get("/banners", isLogin, bannerController.loadBanners)
admin_route.get("/addBanner", isLogin, bannerController.addBanner)
admin_route.post('/addBanner', isLogin, store.single('image') , bannerController.addNewBanner)
admin_route.get('/updateBanner/:id', isLogin, bannerController.updateBanner)
admin_route.post('/updateBanner/:id', isLogin, store.single('image') , bannerController.updateBannerPost)
admin_route.get('/bannerStatus/:id', isLogin, bannerController.bannerStatus)

admin_route.get('/viewCoupon', isLogin, couponController.loadCoupons)
admin_route.get('/addCoupon',isLogin, couponController.loadAddCoupon)
admin_route.post('/addCoupon', couponController.addCouponPost)
admin_route.post('/blockCoupon', couponController.blockCoupon)
admin_route.post('/deleteCoupon', couponController.deleteCoupon)

admin_route.get('/categoryOffer',isLogin, couponController.viewCategoryOffer)
admin_route.get('/addOffer',isLogin, couponController.loadAddOffer)
admin_route.post('/addOffer', couponController.addOfferPost)





admin_route.get('/admin_logout',isLogin,adminController.adminLogout)












admin_route.get('/admin_logout',auth.isLogin,adminController.adminLogout)









module.exports = admin_route