const addProductPost = async (req, res) => {
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
        res.render("add_product", { message: "The product already exists" });
      } else {
        const product = new productData({
          product_name: req.body.product_name,
          product_details: req.body.product_details,
          category: req.body.category,
          price: req.body.price,
          imageUrl:productImages
        });
  
        await product.save();
         
        res.redirect("/view_products");
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  };


  const addproductPost= async (req, res) => {
    try {
      const { name, price, description } = req.body;
      const imageUrl = req.file.path;
  
      const newProduct = new Product({
        name,
        price,
        description,
        imageUrl,
      });
  
      const savedProduct = await newProduct.save();
  
      res.status(201).json(savedProduct);
      res.redirect("/view_products");

    } catch (error) {
      res.status(500).json({ error: 'Failed to add product' });
    }
  };