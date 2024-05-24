const express = require('express')
var user_route = express()
const session = require('express-session')
user_route.set('views', './views/user')
const auth = require("../../middleware/userAuth.js")
const userController = require("../controller/userController")
const cartController = require("../controller/cartController")
const orderController = require("../controller/orderController")
const productController = require("../controller/productController")
const wishlistController = require("../controller/wishlistController")
const couponController = require("../controller/couponController")

const {isLogin,isLogout,blockCheck} = auth
user_route.get('/',userController.index)
user_route.get('/user_register',userController.user_register)
user_route.post('/user_register',userController.user_register_post)

user_route.get('/otp_verification',isLogout, userController.otp_verification)
user_route.post('/otp_verification_post',isLogout, userController.otp_verification_post)
user_route.get("/resentOtp",isLogout,userController.resendOtp )

//Forgot password
user_route.get('/forgot_pass',userController.forgot_password)
user_route.post('/verifyEmail',isLogout,userController.verifyForgotEmail)
user_route.get('/forgotOtpEnter',isLogout,userController.showForgotOtp)
user_route.post('/verifyForgotOtp',isLogout,userController.verifyForgotOtp)
user_route.get('/resendForgotPasswordotp', isLogout ,userController.resendForgotOtp)
user_route.post('/newPassword',isLogout, userController.updatePassword)


user_route.get('/user_login',isLogout, userController.user_login)
user_route.post("/user_login_post",isLogout, userController.user_login_post)

user_route.get('/index',blockCheck, userController.index)
user_route.get('/shop',blockCheck, userController.shop)
user_route.get('/contact', userController.contact)
user_route.get('/productDetails', userController.productDetails)



user_route.get('/my_account',isLogin,blockCheck, userController.my_account)
user_route.post('/updateProfile', userController.updateProfile)
user_route.get('/userOrderDetails', userController.userOrderDetails)
user_route.get('/user_logout',isLogin, userController.user_logout)

user_route.get('/addToCart',isLogin,blockCheck, cartController.addToCart)
user_route.get('/viewCart',isLogin,blockCheck, cartController.viewCart)
user_route.post('/cartUpdation',cartController.updateCart)
user_route.get('/removeCart',isLogin,blockCheck,cartController.removeCart)
user_route.get('/checkout',isLogin,blockCheck, orderController.checkout)
user_route.get('/checkStock', cartController.checkStock)
user_route.post('/validateCoupon', couponController.validateCoupon)



user_route.post('/addNewAddress', userController.addNewAddress)
user_route.post('/updateAddress', userController.updateAddress)
user_route.get('/editAddress', userController.editAddress)
user_route.post('/editAddressPost', userController.editAddressPost)


user_route.post('/placeOrder', orderController.placeOrder)
user_route.get('/orderSuccess', orderController.orderSuccess)
user_route.post('/updateOrder', orderController.updateOrder)


user_route.get('/addToWishlist', isLogin, blockCheck,  wishlistController.addToWishlist)
user_route.get('/wishlist', isLogin, blockCheck, wishlistController.loadWishlist)
user_route.get('/removeWishlist', isLogin, blockCheck,  wishlistController.removeWishlist)











module.exports = user_route
