const userData = require("../model/user_register");
const productData = require("../model/product");
const Category = require("../model/categoryModel");
const Coupon = require("../model/couponModel")



const addToCart = async (req, res) => {
    try {
        const userDatas = req.session.user;
        const productId = req.query.id;
        const quantity = req.query.quantity;
        const userId = userDatas._id;

        const product = await productData.findById(productId);
        const existed = await userData.findOne({ _id: userId, "cart.product": productId });
        // const filter={_id:productId}
        if(quantity > product.stock){
            return res.status(401).end();
        }
        if (existed) {
            await userData.findOneAndUpdate(
                { _id: userId, "cart.product": productId },
                { $inc: { "cart.$.quantity": quantity ? quantity : 1 } },
                { new: true }
            );

            return res.json({ message: "Item already in cart!!" });
        } else {
            // await productData.findOneAndUpdate(filter, { isOnCart: true });
            await userData.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        cart: {
                            product: product._id,
                            quantity: quantity ? quantity : 1,
                        },
                    },
                },
                { new: true }
            );

            return res.json({ message: "Item added to cart" });
        }
    } catch (error) {
        console.log(error.message);
        const userData = req.session.user;
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
const viewCart = async (req, res) => {
    try {
        if(req.session.user){
        req.session.checkout = true
        const userDatas = req.session.user;
        const productId = req.query.id;
         
        const userId = userDatas._id
        const categoryData = await Category.find({ is_blocked: false });
       
        const currentDate = new Date();

        const coupons = await Coupon.find({status: true,expiryDate: { $gt: currentDate }});

        console.log("coupon:",coupons);
        
        const user = await userData.findOne({ _id: userId }).populate({path: 'cart'}).populate({path: 'cart.product', model: 'productCollection', populate: {path: 'categoryID', model: 'category'}});
        const cart = user.cart;
        let subTotal = 0;


              
        if (cart.length === 0) {
            res.render("emptyCart", { userDatas, categoryData ,loggedIn:true});
        } else {
            res.render("Viewcart", { userDatas, coupons,cart, subTotal, categoryData,loggedIn:true, filtertype:null,keyword:null,});
        }
    }else{
        res.render("Viewcart", { userDatas,coupons, cart, subTotal, filtertype:null,keyword:null, categoryData,loggedIn:true });

    }

    } catch (error) {
        console.log(error.message);
        const userDatas = req.session.user;
        const categoryData = await Category.find({ is_blocked: false });
        res.render("404", { userDatas, categoryData ,loggedIn:true,walletBalance});
    }
};

const updateCart = async (req, res) => {
    try {
        const userDatas = req.session.user;
        const data = await userData.find({ _id: userDatas._id }, { _id: 0, cart: 1 }).lean();

        data[0].cart.forEach((val, i) => {
            val.quantity = req.body.datas[i].quantity;
        });

        await userData.updateOne({ _id: userDatas._id }, { $set: { cart: data[0].cart } });
        res.status(200).end();
    } catch (error) {
        console.log(error.message);
    }
};

const removeCart = async (req, res) => {
    try {
        const userDatas = req.session.user;
        const userId = userDatas._id;
        const productId = req.query.productId;
        const cartId = req.query.cartId;

        await productData.findOneAndUpdate({ _id: productId }, { $set: { isOnCart: false } }, { new: true });

        await userData.updateOne({ _id: userId }, { $pull: { cart: { _id: cartId } } });

        res.status(200).send();
    } catch (error) {
        console.log(error.message);
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
    addToCart,
    viewCart,
    updateCart,
    removeCart,
    checkStock
}