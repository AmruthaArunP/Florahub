const productData = require("../model/product");
// const categoryData = require("../model/category");
const Category = require("../model/categoryModel");
const cloudinary = require("../../config/cloudinary");





require("dotenv").config();



const addProduct = async (req, res) => {
  try {
    const categorydata = await Category.find();
    res.render("add_product", { categorydata });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const addProductPost = async (req, res) => {
  const categorydata = await Category.find();
  const { product_name } = req.body;
   try {
    const files = req.files;
    const productImages = [];
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "Products",
      });

      const image = {
        public_id: result.public_id,
        url: result.secure_url
      };
      productImages.push(image)

    }
    const exist = await productData.findOne({ product_name: product_name });
    if (exist) {
      res.render("add_product", { message: "The product already exists", categorydata});
    } else {
      const category = await Category.findOne({category: req.body.category});
      const product = new productData({
        product_name: req.body.product_name,
        product_details: req.body.product_details,
        category: req.body.category,
        price: req.body.price,
        stock: req.body.quantity,
        categoryID: category._id,
        imageUrl:productImages
      });


      await product.save();

      res.redirect("/view_products");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

  const viewProducts = async (req, res) => {
    try {
      const ordersPerPage = 5;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * ordersPerPage;
      const totalCount = await productData.countDocuments();
      const totalPages = Math.ceil(totalCount / ordersPerPage);

      //search
      let query = {};
      if (req.query.search) {
        const searchQuery = new RegExp(req.query.search, 'i');
        query = { product_name: searchQuery };
      }

      if (req.query.filtertype && req.query.filtertype !== 'false') {
        query.category = req.query.filtertype;
      }
      const data = await productData.find(query).sort({ date: -1 }).skip(skip).limit(ordersPerPage);
      res.render("view_products", { data,currentPage: page,totalPages,search: req.query.search,filtertype:req.query.filtertype});
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };

  const deleteProduct = async (req, res) => {
    try {
      const deleteId = req.params.id;
      await productData.findByIdAndDelete(deleteId);
      res.redirect("/view_products");
    } catch (error) {
      res.status(500).send(error.message);
    }
  };

  const updateProduct = async (req, res) => {
    const productId = req.params.id;
   
    try {
      const product = await productData.findById(productId);
      const categoryDatas = await Category.find();
  
      if (!product) {
        return res.render("update_product", { message: "Product not found" });
      }
  
      res.render("update_product", { product, categoryDatas});
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
  const updateProductPost = async (req, res) => {
    const { product_name, product_details, category, price, quantity } = req.body;
    const id = req.params.id;
    console.log(id)
    try {
      const product = await productData.findById(id);
      console.log("product",product)
      if (!product) {
        return res.render("update_product", { message: "Product not found",data:null });
      }

      const categoryID = await Category.findOne({category: req.body.category});
      console.log("********categoryID:",categoryID);
      
      product.product_name = product_name;
      product.product_details = product_details;
      product.category = category;
      product.categoryID = categoryID._id;
      product.price = price;
      product.stock = quantity,
      
      await product.save();
  
      res.redirect("/view_products");
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
  

  //category

  const addCategory = (req, res) => {
    res.render('addCategory')
  };

  const addCategoryPost = async (req, res) => {
    const categoryName = req.body.category_name;
    const categoryDescription = req.body.category_details;
    const categoryOffer = req.body.categoryDiscount;
    const image = req.file;
    const lowerCategoryName = categoryName.toLowerCase();
    try {
  
      const result = await cloudinary.uploader.upload(image.path, {
        folder: "Categories",
      });
      const categoryExist = await Category.findOne({ category: lowerCategoryName });
      if (!categoryExist) {
  
        const category = new Category({
          category: lowerCategoryName,
          imageUrl: {
            public_id: result.public_id,
            url: result.secure_url,
          },
          description: categoryDescription,
          offer:categoryOffer
        });
  
        await category.save();
        console.log("******Data stored in the database******")
        req.session.categorySave = true;
        res.redirect("/viewCategory");
      } else {
        req.session.categoryExist = true;
        res.redirect("/viewCategory");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const viewCategory = async (req, res) => {
    try {
      const data = await Category.find();
      const catlength = data.length;
      res.render("viewCategory", { data,catlength });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };

  const updateCategory = async (req, res) => {
    const categoryId = req.params.id;
  
    try {
      const category = await Category.findById(categoryId);
    
      if (!category) {
        return res.render("updateCategory", { message: "Category not found" });
      }
        res.render("updateCategory", { category });
    } catch (error) {
      res.status(500).send(error.message);
    }
  };

  

  const deleteCategory = async (req, res) => {
    try {
      const deleteId = req.params.id;
      await Category.findByIdAndDelete(deleteId);
      res.redirect("/viewCategory");
    } catch (error) {
      res.status(500).send(error.message);
    }
  };

  const updateCategoryPost = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const categoryName = req.body.category_name;
        const categoryDescription = req.body.category_details;
        const categoryOffer = req.body.categoryDiscount;
        const newImage = req.file;

        const categoryData = await Category.findById(categoryId);
        const categoryImageUrl = categoryData.imageUrl.url;
        let result;

        if (newImage) {
            if (categoryImageUrl) {
                await cloudinary.uploader.destroy(categoryData.imageUrl.public_id);
            }
            const uploadResult = await cloudinary.uploader.upload(newImage.path, {
                folder: "Categories"
            });
            result = {
                public_id: uploadResult.public_id,
                secure_url: uploadResult.secure_url
            };
        } else {
            result = {
                public_id: categoryData.imageUrl.public_id,
                secure_url: categoryImageUrl
            };
        }

        const catExist = await Category.findOne({ category: categoryName, _id: { $ne: categoryId } });
        const imageExist = await Category.findOne({ 'imageUrl.url': result.secure_url, _id: { $ne: categoryId } });

        if (!catExist && !imageExist) {
            await Category.findByIdAndUpdate(
                categoryId,
                {
                    category: categoryName,
                    imageUrl: {
                        public_id: result.public_id,
                        url: result.secure_url
                    },
                    description: categoryDescription,
                    offer:categoryOffer

                },
                { new: true }
            );

            req.session.categoryUpdate = true;
            res.redirect("/viewCategory");
        } else {
            req.session.categoryExist = true;
            res.redirect("/viewCategory");
        }
    } catch (error) {
        console.log(error.message);
    }
};





  


module.exports = {
    addProduct,
    addProductPost,
    viewProducts,
    deleteProduct,
    updateProduct,
    updateProductPost,
    addCategory,
    addCategoryPost,
    viewCategory,
    updateCategory,
    updateCategoryPost,
    deleteCategory,
    
}