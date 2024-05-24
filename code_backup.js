////important

const shop = async (req, res) => {
    console.log(req.query);
    try {
      let filtertype;
      let productDatas, keyword;
      let query = {};
  
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
  
      // Search codes here
  
      // if (keyword) {
      //   const searchQuery = {
      //     $or: [
      //       { product_name: { $regex: ".*" + keyword + ".*", $options: "i" } },
      //       { category: { $regex: ".*" +  + ".*", $options: "i" } },
      //     ],
      //   };
  
      //   // If a category filter is applied, combine it with the search query
      //   if (filtertype) {
      //     query = {
      //       $and: [query, searchQuery],
      //     };
      //   } else {
      //     // Otherwise, use only the search query
      //     query = searchQuery;
      //   }
  
      //   productDatas = await productData.find(query);
      // } else if (filtertype) {
      //   // If no search query, but a category filter is applied, use the category filter
      //   productDatas = await productData.find(query);
      // } else 
      //   // If no search or filter, retrieve all products
      productDatas = await productData.find(query).populate({ path: 'categoryID', model: 'category' });
  
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
  
       
        res.render("shop", {productDatas,userDatas,cart,subTotal,categoryData,filtertype,wishlistLength:null,message: "true",keyword});
      } else {
        res.render("shop", { productDatas,filtertype, message: "false",keyword });
      }
  
  
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };

  ////////end imp

  ///////////// shop.ejs

  


const checkout = async (req, res) => {
  try {
      const productDatas = await productData.find();

      if (req.session.user) {
          const userDatas = req.session.user;
          const userMeta = await userData.findById(userDatas._id)
          // const walletBalance = userMeta.wallet.balance;
          console.log("walletBalance",walletBalance)
          req.session.checkout = true;

          const userId = userDatas._id;
          const  userMetas = await userData.findById(userId);
          const wishlistLength = userMetas.wishlist.length;
          
          const addressData = await Address.find({ userId: userId });
          const bannerData = await Banner.find({ active: true });

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
              categoryData,
              loggedIn: true,
              message: "true",
          });
      }
  } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
  }
};



 const placeOrder = async (req, res) => {
    try {

        const userDatas = req.session.user;
        const walletBalance = userDatas.wallet.balance
        const userId = userDatas._id;

        const addressId = req.body.selectedAddress;
        const amount = req.body.amount;
        const paymentMethod = req.body.selectedPayment;
        const couponData = req.body.couponData;

        const user = await userData
            .findOne({ _id: userId })
            .populate("cart.product");
        // const user = await userData.findOne({ _id: userId }).populate({path: 'cart'}).populate({path: 'cart.product', model: 'productCollection'});

        const userCart = user.cart;

        let subTotal = 0;
        let offerDiscount = 0;

        userCart.forEach((item) => {
            item.total = item.product.price * item.quantity;
            subTotal += item.total;
        });

        userCart.forEach((item) => {
            if (item.product.oldPrice > 0) {
                item.offerDiscount =
                    (item.product.oldPrice - item.product.price) * item.quantity;
                offerDiscount += item.offerDiscount;
            }
        });

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
                const order = new Order({
                    userId: userId,
                    product: productDatas,
                    address: addressId,
                    orderId: orderId,
                    total: amount,
                    ExpectedDeliveryDate: ExpectedDeliveryDate,
                    offerDiscount: offerDiscount,
                    paymentMethod: paymentMethod,
                    discountAmount: couponData.discountAmount,
                    amountAfterDiscount: couponData.newTotal,
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
                    offerDiscount: offerDiscount,
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
                // const updatedStockPositive = updatedStock > 0 ? updatedStock : 0;


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
        console.log(error.message);
    }
};


const addToCart = async (productId) => {

    try {
        console.log("add to cart")
    event.preventDefault();
        const addToCartButton = document.getElementById("addToCartBtn");
        const newButton = document.querySelectorAll("#addToCartBtn")
        let quantity = document.getElementById(productId).value;
        
        if(quantity === null){
            quantity = 1
        }
              
        const response = await fetch(`/addToCart?id=${productId}&quantity=${quantity}`, {
    
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        
        let data = await response.json();
        if (data.message === "Item already in cart!!") {
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Product is already in cart.\n So quantity increased",
                showConfirmButton: true,
                confirmButtonColor: "#79a206",
            });
        } else {
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Product successfully added to cart",
                showConfirmButton: true,
                confirmButtonColor: "#79a206",
            });
        }
    } catch (error) {
        console.error("An error occurred:", error);
        // You can add code here to handle the error, show an error message, or perform any other necessary actions.
    }
    };


    const proceedToCheckout = async () => {
        const response = await fetch("/checkStock", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
    
        const data = await response.json();
    
        if (data.message === "In stock") {
            window.location.href = "/checkout";
        } else {
            data.forEach((element) => {
                Swal.fire({
                    icon: "error",
                    title: `${element.name}\nis out of stock!!`,
                    showConfirmButton: true,
                    confirmButtonText: "CANCEL",
                    confirmButtonColor: "#D22B2B",
                });
            });
        }
    };
    
    
    
            






