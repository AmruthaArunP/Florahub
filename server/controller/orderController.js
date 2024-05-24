const userData = require("../model/user_register");
const productData = require("../model/product");
const Category = require("../model/categoryModel");
const Address = require("../model/address");
const Order = require("../model/order");
const Razorpay = require("razorpay");
require('dotenv').config();
const Coupon = require("../model/couponModel");
const Banner = require("../model/bannerModel");


let coupon
const checkout = async (req, res) => {
    try {
        const productDatas = await productData.find();
        
        if (req.session.user) {
            const userDatas = req.session.user;
            const userMeta = await userData.findById(userDatas._id)
            const walletBalance = userMeta.wallet.balance;
            console.log("walletBalance*********",walletBalance)
            req.session.checkout = true;
  
            const userId = userDatas._id;
            const  userMetas = await userData.findById(userId);
            const wishlistLength = userMetas.wishlist.length;
            
            const addressData = await Address.find({ userId: userId });
            const bannerData = await Banner.find({ active: true });
            coupon = await Coupon.find()
            
            const categoryData = await Category.find({ is_blocked: false });
            const currentDate = new Date();

            const coupons = await Coupon.find({status: true,expiryDate: { $gt: currentDate }});

            console.log("coupon:",coupons);
            
            const user = await userData
                .findOne({ _id: userId })
                .populate({ path: "cart" })
                .populate({ path: "cart.product", model: "productCollection", populate: {path: 'categoryID', model: 'category'} });
            const cart = user.cart;
            let subTotal = 0;
  
            cart.forEach((val) => {
                val.total = val.product.price * val.quantity;
                subTotal += val.total;
            });
  
            //
  
            const now = new Date();
            const availableCoupons = await Coupon.find({
                expiryDate: { $gte: now },
                usedBy: { $nin: [userId] },
                status: true,
            });
  
            res.render("checkout", {
                addressData,
                bannerData,
                productDatas,
                userDatas,
                cart,
                wishlistLength,
                walletBalance,
                availableCoupons,
                subTotal,
                coupons,
                categoryData,
                filtertype:null,keyword:null,
                loggedIn: true,
                message: "true",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
  };
  
  const updateCart = async (req, res) => {
    try {
    } catch (error) {
        console.log(error);
    }
  };





  const placeOrder = async (req, res) => {

    try {
        const coupon =req.body.couponData;
        const couponData = await Coupon.findOne({ code: coupon });
        let newTotal;
        const userDatas = req.session.user;
        const walletBalance = userDatas.wallet.balance
        const userId = userDatas._id;
        const addressId = req.body.selectedAddress;
        const amount = req.body.amount;
        const paymentMethod = req.body.selectedPayment;
        const user = await userData.findOne({ _id: userId }).populate({path: 'cart'}).populate({path: 'cart.product', model: 'productCollection', populate: {path: 'categoryID', model: 'category'}});
        const userCart = user.cart;

        let subTotal = 0;
        userCart.forEach((item)=> { 
            subTotal += (item.product.price - (item.product.price * (item.product.categoryID.offer / 100))) * item.quantity;
        })
        let productDatas = userCart.map((item) => {
            return {
                id: item.product._id,
                name: item.product.product_name,
                category: item.product.category,
                price: item.product.price,
                quantity: item.quantity,
                image: item.product.imageUrl[0].url,
            };
        });

        const result = Math.random().toString(36).substring(2, 7);
        const id = Math.floor(100000 + Math.random() * 900000);
        const orderId = result + id;

        let saveOrder = async () => {
            const ExpectedDeliveryDate = new Date();
            ExpectedDeliveryDate.setDate(ExpectedDeliveryDate.getDate() + 3);

            if (couponData) {
                const discount = couponData.discount;
                const minDiscount = couponData.minDiscount
                const maxDiscount = couponData.maxDiscount
                let discountAmount
                let maximum
                const discountValue = Number(discount);
                const couponDiscount = (subTotal * discountValue) / 100;
                if (couponDiscount < minDiscount) {

                    res.json("minimum value not met")
        
                } else {
                    if (couponDiscount > maxDiscount) {
                        discountAmount = maxDiscount
                        maximum = "maximum"
                    } else {
                        discountAmount = couponDiscount
                    }
        
                     newTotal = subTotal - discountAmount;
                    const couponName = coupon;
                }
                const order = new Order({
                    userId: userId,
                    product: productDatas,
                    address: addressId,
                    orderId: orderId,
                    total: subTotal,
                    ExpectedDeliveryDate: ExpectedDeliveryDate,
                    offerDiscount: couponDiscount,
                    paymentMethod: paymentMethod,
                    discountAmount: couponDiscount,
                    amountAfterDiscount: newTotal,
                    couponName: couponData.couponName,
                });

                await order.save();

                const couponCode = couponData.couponName;
                await Coupon.updateOne(
                    { code: couponCode },
                    { $push: { usedBy: userId } }
                );
            } else {
                const order = new Order({
                    userId: userId,
                    product: productDatas,
                    address: addressId,
                    orderId: orderId,
                    total: subTotal,
                    ExpectedDeliveryDate: ExpectedDeliveryDate,
                    offerDiscount: 0,
                    paymentMethod: paymentMethod,
                });

                const orderSuccess = await order.save();
            }

            let userDetails = await userData.findById(userId);
            let userCartDetails = userDetails.cart;

            userCartDetails.forEach(async (item) => {
                const productId = item.product;
                const quantity = item.quantity;

                const product = await productData.findById(productId);
                const stock = product.stock;

                const updatedStock = stock - quantity;
                await productData.findByIdAndUpdate(
                    productId,
                    { $set: { stock: updatedStock, isOnCart: false } },
                    { new: true }
                );
            });

            userDetails.cart = [];
            await userDetails.save();
        };

        if (addressId) {
            if (paymentMethod === "Cash On Delivery") {
                saveOrder();
                req.session.checkout = false;

                res.json({
                    order: "Success",
                });
            } else if (paymentMethod === "Razorpay") {
                var instance = new Razorpay({
                    key_id: process.env.RAZORPAY_KEY_ID,
                    key_secret: process.env.RAZORPAY_KEY_SECRET,
                });

                const order = await instance.orders.create({
                    amount: amount * 100,
                    currency: "INR",
                    receipt: "Gadgetry",
                });

                saveOrder();
                req.session.checkout = false;

                res.json({
                    order: "Success",
                });
            } else if (paymentMethod === "Wallet") {
                try {
                    const walletBalance = req.body.walletBalance;

                    await userData.findByIdAndUpdate(userId, { $set: { "wallet.balance": walletBalance } }, { new: true });

                    const transaction = {
                        date: new Date(),
                        details: `Confirmed Order - ${orderId}`,
                        amount: subTotal,
                        status: "Debit",
                    };

                    await userData.findByIdAndUpdate(userId, { $push: { "wallet.transactions": transaction } }, { new: true })

                    saveOrder();
                    req.session.checkout = false

                    res.json({
                        order: "Success",
                    });
                } catch (error) {
                    console.log(error.message);
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};

const orderSuccess = async (req, res) => {
    try {
        const userData = req.session.user;
        const categoryData = await Category.find({ is_blocked: false });
        const bannerData = await Banner.find({ active: true });

        var useremail = req.session.user.email;
        res.render("orderSuccess", {
            userData,
            categoryData,
            bannerData,
            loggedIn: true,
            useremail,
        });
    } catch (error) {
        console.log(error.message);
    }
};


const orderDetails = async (req, res) => {
    try {

        const orderId = req.query.orderId;

        const orderDetails = await Order.findById(orderId);
        const orderProductData = orderDetails.product;
        const addressId = orderDetails.address;

        const addressData = await Address.findById(addressId);

        res.render("orderDetails", {
            orderDetails,
            orderProductData,
            addressData,
            user: req.session.admin,
        });
    } catch (error) {
        console.log(error.message);
    }
};
const updateOrder = async (req, res) => {
    console.log(req.body);
    try {
        const orderId = req.body.orderId;
        const status = req.body.status;

        if (status === "Delivered") {
            const returnEndDate = new Date();
            returnEndDate.setDate(returnEndDate.getDate() + 7);

            await Order.findByIdAndUpdate(
                orderId,
                {
                    $set: {
                        status: status,
                        deliveredDate: new Date(),
                        returnEndDate: returnEndDate,
                    },
                    $unset: { ExpectedDeliveryDate: "" },
                },
                { new: true }
            );
        } else if (status === "Cancelled") {

            await Order.findByIdAndUpdate(
                orderId,
                {
                    $set: {
                        status: status,
                    },
                    $unset: { ExpectedDeliveryDate: "" },
                },
                { new: true }
            );
            const order = await Order.findOne({orderId});
            await userData.findByIdAndUpdate(
                order.userId,
                {
                    $set: {
                        'wallet.balance': updatedBalance
                    }
                },
                { new: true }
            );

        } else {
            await Order.findByIdAndUpdate(
                orderId,
                {
                    $set: {
                        status: status,
                    },
                },
                { new: true }
            );
        }

        res.json({
            message: "Cancelled",
        });
    } catch (error) {
        console.log(error);
    }
};
  
  
  
  


const checkStock = async (req, res) => {
    try {
        const userData = req.session.user;
        const userId = userData._id;

        const userCart = await User.findOne({ _id: userId }).populate("cart.product").lean();
        const cart = userCart.cart;

        let stock = [];

        cart.forEach((element) => {
            if (element.product.stock - element.quantity <= 0) {
                stock.push(element.product);
            }
        });

        if (stock.length > 0) {
            res.json(stock);
        } else {
            res.json({ message: "In stock" });
        }
    } catch (error) {
        console.log(error.message);
    }
};






module.exports = {
    checkout,
    orderSuccess,
    placeOrder,
    orderDetails,
    updateOrder,
    checkStock

}