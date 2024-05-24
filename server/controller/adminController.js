// const customerData = require("../models/mongo")
const customerData = require("../model/user_register");
const Order = require("../model/order");
const productData = require("../model/product");
const userData = require("../model/user_register");
const cloudinary = require("../../config/cloudinary")
const Address = require("../model/address");
const Category = require("../model/categoryModel");
require('dotenv').config();



const adminSignin = (req, res) => {
    if (req.session.admin) {
        res.redirect("/admin_dashboard");
    } else {
        res.render("sign_in", { message: "" });
    }
};

const adminSigninPost = (req, res) => {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        req.session.admin = email;
        res.redirect("admin_dashboard");
    } else {
        res.render("sign_in", { message: "Invalid username or password", admin: true });
    }
};




   /////////////////////////////////View Customers///////////////////////

const viewCustomers = async (req, res) => {
    try {
        const data = await customerData.find();
        res.render('customers', { data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

///////////////////////user block//////////////////////////////////////////////

const blockUser = async (req, res) => {
    try {
        const id = req.query.customerid;
        console.log(id);
        const blockUser = await customerData.findById(id);
        await customerData.findByIdAndUpdate(id, { $set: { is_blocked: !blockUser.is_blocked } }, { new: true });
        // res.redirect("/customers");
         res.json({ message: "success" });
    } catch (error) {
        console.log(error);
    }
};

const unblockUser = async (req, res) => {
    try {
        const id = req.query.customerid;
        console.log(id);
        const blockUser = await customerData.findById(id);
        await customerData.findByIdAndUpdate(id, { $set: { is_blocked: blockUser.is_blocked } }, { new: true });
        res.json({ message: "success" });
    } catch (error) {
        console.log(error);
    }
};
///////////////Log_out//////////////////////////////////////////

const adminLogout = (req, res) => {
    delete req.session.admin;
    res.redirect("/admin_sign_in"); // Redirect to the login page after logout
};

/////////////////////////ViewOrders///////////////////////////

const viewOrders = async (req, res) => {
    try {
        const ordersPerPage = 8;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ordersPerPage;
        let orderData = await Order.find().sort({ date: -1 }).skip(skip).limit(ordersPerPage);
        const user = await userData.findOne().populate({ path: 'cart' }).populate({ path: 'cart.product', model: 'productCollection' });

        const totalCount = await Order.countDocuments();
        const totalPages = Math.ceil(totalCount / ordersPerPage);

        res.render("viewOrders", { user, orderData,currentPage: page,totalPages,message: "true" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};













module.exports = {
    adminSignin,
    adminSigninPost,
    
    adminLogout,
    viewCustomers,
    blockUser,
    unblockUser,
    viewOrders
    };


