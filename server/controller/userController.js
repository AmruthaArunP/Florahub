const userData = require("../model/user_register");
const helperFunction = require("../../helperFunctions/userHelper");
const bcrypt = require("bcrypt");
const Category = require("../model/categoryModel");
const productData = require("../model/product");
const Address = require("../model/address");
const Order = require("../model/order");
const Banner = require("../model/bannerModel");

let generatedOtp;
let user_name;
let emailId;
let mobile;
let address;
let password;
let forgotPasswordOtp


const index = async (req, res) => {
  try {
    let keyword;
    let query={}
    // Search key retaining search place
    if (req.query.keyword && req.query.keyword !== 'false') {
      keyword = req.query.keyword;
      query.product_name = new RegExp(keyword, 'i');
      } else {
      keyword = false;
      }
    
    const productDatas = await productData.find().populate({path: 'categoryID', model: 'category'});
    const logged = req.session.user;
    const bannerData = await Banner.find({ active: true });
    const categoryData = await Category.find({ is_blocked: false });
     console.log("product data:",productDatas);
    if (req.session.user) {
      const userDatas = req.session.user;
      let cartId = null;
      req.session.checkout = true;

      const userId = userDatas._id;
     const  userMeta = await userData.findById(userId);
      const wishlistLength = userMeta.wishlist.length;

      const user = await userData
        .findOne({ _id: userId })
        .populate({ path: "cart" })
        .populate({ path: "cart.product", model: "productCollection" });
      const cart = user.cart;
      let subTotal = 0;

      if (cart.length == 0) {
        return res.render("index", {
          productDatas,
          bannerData,
          logged,
          cartId,
          keyword,
          filtertype:null,
          message: "false",
        });
      } else {
        cart.forEach((val) => {
          val.total = val.product.price * val.quantity;
          subTotal += val.total;
        });
        res.render("index", {
          productDatas,
          bannerData,
          userDatas,
          cart,
          cartId,
          wishlistLength,
          subTotal,
          filtertype:null,
          categoryData,
          keyword,
          message: "true",
        });
      }
    } else {
      res.render("index", {
        productDatas,
        bannerData,
        categoryData,
        cartId:null,
        logged,
        keyword,
        filtertype:null,
        message: "false",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


//user Registration
const user_register = (req, res) => {
    try {
      res.render("user_register", { message: "",keyword:null,filtertype:null });
      if (req.session.user) {
        res.redirect("my_account");
      } else {
        res.render("user_register", { userSignup: true });
      }
    } catch (error) {
      console.log(error);
    }
  };

  //user registration POST

  const user_register_post = async (req, res) => {
    try {
      let { email, phone } = req.body;
      const emailExist = await userData.findOne({ email: email });
      const phoneExist = await userData.findOne({ phone: phone });
      const valid = helperFunction.validateRegister(req.body);
  
      if (emailExist) {
        return res.status(401).json({
          error:
            "user with same email Id already exists please try another email",
        });
      } else if (phoneExist) {
        return res.status(405).json({
          error:
            "The user with same mobile number already exist please try another number",
        });
      } else if (!valid.isValid) {
        return res.status(400).json({ error: valid.errors });
      } else {
        generatedOtp = helperFunction.generateOTP();
        user_name = req.body.user_name;
        emailId = req.body.email;
        mobile = req.body.phone;
        address = req.body.address;
        // password = await bcrypt.hash(req.body.password, 10);  
        password=req.body.password;
        helperFunction.sendOtpMail(email, generatedOtp);
        return res.status(200).end();
      }
    } catch (error) {
      console.log(error);
    }
  };

// OTP Verification
const otp_verification = async (req, res) => {
    res.render("otp_verification", { message: "" });
  };
  
  const otp_verification_post = async (req, res) => {
    try {
      var txt1 = req.body.txt1;
      var txt2 = req.body.txt2;
      var txt3 = req.body.txt3;
      var txt4 = req.body.txt4;
      const EnteredOtp = txt1 + txt2 + txt3 + txt4;
  
      if (EnteredOtp === generatedOtp) {
        const securedPassword = await helperFunction.securePassword(password);
  
        const newUser = new userData({
          user_name: user_name,
          email: emailId,
          phone: mobile,
          address: address,
          password: securedPassword,
  
          is_blocked: false,
        });
   
        await newUser.save();
        console.log("-user data saved in the database-");
        res.render("user_login", {
          message: "Successfully registered!",
          loggedIn: false,
          blocked: false, keyword:null,filtertype:null
        });
      } else {
        res.render("otp_verification", { message: "wrong OTP", keyword:null,filtertype:null});
      }
    } catch (error) {
      console.log(error);
      res.render("otp_verification", {
        message: "Error registering new user",
        loggedIn: false,keyword:null,filtertype:null
      });
    }
  };
      //resend otp
  const resendOtp = (req, res) => {
    try {
      const newOtp = helperFunction.generateOTP();
      generatedOtp = newOtp;
      helperFunction.sendOtpMail(emailId, newOtp);
      console.log(`+ new_otp ${newOtp}`);
    } catch (error) {
      console.log(error);
    }
  };

  //forgot password
 
  const forgot_password = async (req, res) => {
    try {
      
        const categoryData = await Category.find({ is_blocked: false });
    
        if (req.session.forgotEmailNotExist) {
           
            res.render("forgot_password", {categoryData,emailNotExist: "Sorry, email does not exist! Please register now!" ,loggedIn:false,walletBalance,subTotal:0,cart:{},keyword:null,filtertype:null});
            req.session.forgotEmailNotExist = false;
        } else {
              res.render("forgot_password",{loggedIn:false,categoryData,keyword:null,filtertype:null});
        }
    } catch (error) {
        console.log(error.message);
    }
};

  
  // verifying email and sending otp
  const verifyForgotEmail = async (req, res) => {
    try {
        const verifyEmail = req.body.email;
        const ExistingEmail = await userData.findOne({ email: verifyEmail });

        if (ExistingEmail) {
            if (!forgotPasswordOtp) {
                forgotPasswordOtp = helperFunction.generateOTP();
                console.log(forgotPasswordOtp);
                emailId = verifyEmail;
                helperFunction.sendOtpMail(emailId, forgotPasswordOtp);
                res.redirect("/forgotOtpEnter");
                setTimeout(() => {
                    forgotPasswordOtp = null;
                }, 60 * 1000);
            } else {
                res.redirect("/forgotOtpEnter");
            }
        } else {
            req.session.forgotEmailNotExist = true;
            res.redirect("/forgotPassword");
        }
    } catch (error) {
        console.log(error.message);
    }
};



const showForgotOtp = async (req, res) => {
  try {
      const categoryData = await Category.find({ is_blocked: false });
      if (req.session.wrongOtp) {
          res.render("forgotOtpEnter", { invalidOtp: "Otp does not match" ,loggedIn:false,keyword:null,filtertype:null});
          req.session.wrongOtp = false;
      } else {
          res.render("forgotOtpEnter", { countdown: true ,loggedIn:false, invalidOtp:"",keyword:null,filtertype:null });
      }
  } catch (error) {
      console.log(error.message);
  }
};

const verifyForgotOtp = async (req, res) => {
  try {
      var txt1=req.body.txt1;
      var txt2 =req.body.txt2
      var txt3=req.body.txt3
      var txt4=req.body.txt4
      const userEnteredOtp = txt1+txt2+txt3+txt4
   
      if (userEnteredOtp === forgotPasswordOtp) {
          res.render("passwordReset",{loggedIn:false,invalidOtp:"",keyword:null,filtertype:null});
      } else {
          req.session.wrongOtp = true;
          res.redirect("/forgotOtpEnter");
      }
  } catch (error) {
      console.log(error.message);
  }
};

const resendForgotOtp = async (req, res) => {
    try {
      const generatedOtp = helperFunction.generateOTP();
      forgotPasswordOtp = generatedOtp;

      helperFunction.sendOtpMail(emailId, forgotPasswordOtp);
      res.redirect("/forgotOtpEnter");
      setTimeout(() => {
          forgotPasswordOtp = null;
      }, 60 * 1000);
  } catch (error) {
      console.log(error.message);
  }
};

const updatePassword = async (req, res) => {
  try {
      const newPassword = req.body.password;
      const securedPassword = await helperFunction.securePassword(newPassword);

      const userDataS = await userData.findOneAndUpdate({ email: emailId }, { $set: { password: securedPassword } });
      if (userDataS) {
          req.session.passwordUpdated = true;
          res.render("user_login",{message: "Password updated successfully7",blocked:false,loggedIn:false,keyword:null,filtertype:null});
      } else {
          console.log("Something error happened");
      }
  } catch (error) {
      console.log(error.message);
  }
};

       //login get

   const user_login = (req, res) => {
    let keyword;
    let query={}
    // Search key retaining search place
    if (req.query.keyword && req.query.keyword !== 'false') {
      keyword = req.query.keyword;
      query.product_name = new RegExp(keyword, 'i');
      } else {
      keyword = false;
      }
    if (req.session.user) {
      res.redirect("/my_account");
    } else {
      res.render("user_login", { message: "",keyword:null,filtertype:null });
    }
  };



  // User Login Post
  const user_login_post = async (req, res) => {
    try {
    let keyword;

      const { user_name, password } = req.body;
      if (!user_name || !password) {
        res.render("user_login", {message: "Username and Password can't be empty",keyword:null,filtertype:null});
      }
      let email = user_name;
      let exist = await userData.findOne({ email: email });
  
      if (exist) {
        if (exist.is_blocked) {
          res.render("user_login", { message: "You account is blocked !!" ,keyword:null,filtertype:null});
        }
  
        const decodedPassword = await bcrypt.compare(password, exist.password);
        const userStatus = exist.is_blocked;
  
        if (decodedPassword && userStatus == false) {
          req.session.user = exist;
          res.redirect("index");
        } else {
          res.render("user_login", { message: "The password is incorrect" ,keyword:null,filtertype:null});
        }
      } else {
        res.render("user_login", { message: "User not found please signup" ,keyword:null,filtertype:null});
      }
    } catch (error) {
      console.log(error);
    }
  };
  



const my_account = async (req, res) => {
  try {
    if (req.session.user) {
      let keyword;
      let query={}
      // Search key retaining search place
      if (req.query.keyword && req.query.keyword !== 'false') {
        keyword = req.query.keyword;
        query.product_name = new RegExp(keyword, 'i');
        } else {
        keyword = false;
        }
      const userDatas = req.session.user;
      const userId = userDatas._id;
      const categoryData = await Category.find({ is_blocked: false });
      const addressData = await Address.find({ userId: userId });
      const orderData = await Order.find({ userId: userId });
      const productDatas = await productData.find();

      //transactions data here
      req.session.checkout = true;
      const userMeta = await userData.findById(userId);
      const walletBalance = userMeta.wallet.balance;
      const user = await userData
        .findOne({ _id: userId })
        .populate({ path: "cart" })
        .populate({ path: "cart.product", model: "productCollection" });
      const profilename = userMeta.user_name;

      const cart = user.cart;
      let subTotal = 0;

      cart.forEach((val) => {
        val.total = val.product.price * val.quantity;
        subTotal += val.total;
      });
      res.render("my_account", {
        userDatas,
        userMeta,
        walletBalance,
        orderData,
        categoryData,
        cart,
        addressData,
        profilename,
        message: "true",
        productDatas,
        subTotal,
        keyword,
        filtertype:null,
        wishlistLength:null,
      });
    } else {
      res.render("my_account", {
        cart,
        addressData,
        profilename,
        keyword,
        filtertype:null,
        message: "false",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};


const shop = async (req, res) => {
  try {
    let filtertype;
    let productDatas, keyword;
    let query = {};
    const ITEMS_PER_PAGE = 8;

    // Retaining search key for the search input
    if (req.query.keyword && req.query.keyword !== 'false') {
      keyword = req.query.keyword;
      query.product_name = new RegExp(keyword, 'i');
    } else {
      keyword = false;
    }

    // Initialize the base query
    if (req.query.filtertype && req.filtertype !== 'false') {
      query.category = req.query.filtertype;
    } else {
      filtertype = false;
    }

    let sortOption = {}; 
    if (req.query.sort) {
      if (req.query.sort === 'low-to-high') {
        sortOption = { price: 1 }; 
      } else if (req.query.sort === 'high-to-low') {
        sortOption = { price: -1 }; 
      }
    }

    const page = +req.query.page || 1;
    const totalProducts = await productData.countDocuments(query); 
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
    const skip = (page - 1) * ITEMS_PER_PAGE;
    productDatas = await productData.find(query).sort(sortOption).skip(skip).limit(ITEMS_PER_PAGE).populate({ path: 'categoryID', model: 'category' });

    

    // productDatas = await productData.find(query).sort(sortOption).populate({ path: 'categoryID', model: 'category' });
    // category filter
    if (req.session.user) {
      req.session.checkout = true;
      const userDatas = req.session.user;
      const userId = userDatas._id;
      const filtertype= req.query.filtertype
      // walletBalance=userDatas.wallet.balance
      const categoryData = await Category.find({ is_blocked: false });
      const user = await userData
        .findOne({ _id: userId })
        .populate({ path: "cart" })
        .populate({ path: "cart.product", model: "productCollection" });
      const cart = user.cart;
      let subTotal = 0;

      res.render("shop", {productDatas,userDatas,cart,subTotal,categoryData,filtertype,wishlistLength:null,message: "true",keyword,cartId: null,sort: req.query.sort,currentPage: page,totalPages});
    } else {
      res.render("shop", { productDatas,filtertype, message: "false",keyword , cartId: null,sort: req.query.sort,currentPage: page,totalPages});
    }


  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};





const user_logout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log("Error destroying session:", err);
      } else {
        res.redirect("/user_login"); // Redirect to the login page after logout
      }
    });
  } catch (error) {
    console.log(error);
  }
};
const contact = async (req, res) => {
  try {
    const productDatas = await productData.find();
    const logged = req.session.user;
    let keyword;
    let query={}
    // Search key retaining search place
    if (req.query.keyword && req.query.keyword !== 'false') {
      keyword = req.query.keyword;
      query.product_name = new RegExp(keyword, 'i');
      } else {
      keyword = false;
      }
    if (req.session.user) {
      const userDatas = req.session.user;

      req.session.checkout = true;

      const userId = userDatas._id;
      const  userMeta = await userData.findById(userId);
      const wishlistLength = userMeta.wishlist.length;
      console.log("wishlistLength",wishlistLength)
      walletBalance = userDatas.wallet.balance
      const categoryData = await Category.find({ is_blocked: false });

      const user = await userData
        .findOne({ _id: userId })
        .populate({ path: "cart" })
        .populate({ path: "cart.product", model: "productCollection" });
      const cart = user.cart;
      let subTotal = 0;

      cart.forEach((val) => {
        val.total = val.product.price * val.quantity;
        subTotal += val.total;
      });

      res.render("contact", {
        productDatas,
        userDatas,
        cart,
        wishlistLength,
        subTotal,
        categoryData,
        message: "true",
        keyword:null,
        filtertype:null
      });
    } else {
      res.render("contact", { productDatas, logged, message: "false",keyword:null,filtertype:null });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};



const productDetails = async (req, res) => {
  try {
    const productId = req.query.id;
    const productDatas = await productData.find();
    const logged = req.session.user;
    const userDatas = req.session.user;
    const product = await productData.findById(productId).populate({path: 'categoryID', model: 'category'});;
    const image = product.imageUrl;
    if (userDatas) {
      req.session.checkout = true;

      const userId = userDatas._id;
      // walletBalance = userDatas.wallet.balance
      const categoryData = await Category.find({ is_blocked: false });

      const user = await userData
        .findOne({ _id: userId })
        .populate({ path: "cart" })
        .populate({ path: "cart.product", model: "productCollection" });
      const cart = user.cart;
      let subTotal = 0;

      cart.forEach((val) => {
        val.total = val.product.price * val.quantity;
        subTotal += val.total;
      });




      res.render("productDetails", {
        product,
        userDatas,
        userData:null,
        image,
        cartId: null,
        wishlistLength:null,
        productDatas,
        cart,
        subTotal,
        categoryData,
        filtertype:null,
        keyword:null,
        message: "true",
      });
    } else {
      res.render("productDetails", {
        product,
        userDatas,
        cartId: null,
        wishlistLength:null,
        filtertype:null,
        keyword:null,
        image,
        message: "",
        productDatas, logged, message: "false"

      });
    }

  } catch (error) {
    res.status(500).send(error.message);
  }
};


const addNewAddress = async (req, res) => {
  try {
    const userData = req.session.user;
    const userId = userData._id;

    const address = new Address({
      userId: userId,
      name: req.body.name,
      mobile: req.body.mobile,
      addressLine: req.body.addressLine,
      city: req.body.city,
      email: req.body.email,
      state: req.body.state,
      pincode: req.body.pincode,
      is_default: false,
    });
    console.log(`ship adrs..${address}`);

    await address.save();
    res.status(200).send();
  } catch (error) {
    res.status(500).send();
    console.log(error.message);
  }
};

const updateAddress = async (req, res) => {
  try {
    const addressId = req.query.addressId;

    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      {
        name: req.body.name,
        mobile: req.body.mobile,
        addressLine: req.body.addressLine,
        email: req.body.email,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
      },
      { new: true }
    );

    if (updatedAddress) {
      res.status(200).send();
    } else {
      res.status(500).send();
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editAddress = async (req, res) => {
  try {
    const addressId = req.query.addressId;
    const address = await Address.findById(addressId);
    res.render("editAddress", { address, message: "" });
  } catch (error) {
    console.log(error);
  }
};

const editAddressPost = async (req, res) => {
  try {
    const addressId = req.query.addressId;
    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      {
        name: req.body.name,
        mobile: req.body.mobile,
        addressLine: req.body.addressLine,
        email: req.body.email,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
      },
      { new: true }
    );

    if (updatedAddress) {
      res.status(200).send();
    } else {
      res.status(500).send();
    }
  } catch (error) {
    console.log(error);
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.session.user;
    const updatedProfile = await userData.findByIdAndUpdate(
      userId,
      {
        user_name: req.body.user_name,
        phone: req.body.phone,
        address: req.body.address,
        email: req.body.email,
      },
      { new: true }
    );

  } catch (error) {
    console.log(error);

  }
};

const userOrderDetails = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const user = req.session.user;
    const orderDetails = await Order.findById(orderId);
    const orderProductData = orderDetails.product;
    const addressId = orderDetails.address;
    const walletBalance = user.wallet.balance;
    const addressData = await Address.findById(addressId);

    res.render("userOrderDetails", {
      orderDetails,
      orderProductData,
      addressData,
      currentDate:null,
      returnEndDate:null,
      walletBalance,
      message: "",
    });
  } catch (error) {
    console.log(error.message);
  }
};



module.exports={
    index,
    user_register,
    user_register_post,
    otp_verification_post,
    otp_verification,
    showForgotOtp,
    resendOtp,
    verifyForgotOtp,
    resendForgotOtp,
    updatePassword,
    forgot_password,
    user_login,
    user_login_post,
    verifyForgotEmail,
    my_account,
    shop,
    user_logout,
    productDetails,
    addNewAddress,
    editAddress,
    editAddressPost,
    updateAddress,
    updateProfile,
    userOrderDetails,
    contact
}
