const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Product = require("../models/Product");
const IsEmpty = require("./../validators/IsEmpty");
const ObjectId = require("mongoose").Types.ObjectId;

router.post("/createProduct", (req, res) => {
  if (!req.body.name && IsEmpty(req.body.name))
    return res.json({
      success: false,
      message: "Please Provide Product Name"
    });

  const newProduct = new Product({
    name: req.body.name
  });

  newProduct
    .save()
    .then(post =>
      res.json({
        success: true,
        message: "Product Created."
      })
    )
    .catch(err => {
      if (err.code == 11000) {
        return res.json({
          success: false,
          message: "Please Provide diffrent Product Name"
        });
      }

      return res.json({
        success: false,
        message: err
      });
    });
});

// .populate({path:'user'})

// @all products

router.get("/products", (req, res) => {
  Product.find()
    .sort({
      createdOn: -1
    })
    .then(products => {
      if (products.length == 0)
        return (
          res, json({ success: false, message: "No Post is created yet!" })
        );
      res.json({
        success: true,
        data: products
      });
    })
    .catch(err =>
      res.status(404).json({
        success: false,
        message: err
      })
    );
});

router.post("/createCategory", (req, res) => {
  if (!req.body.name && IsEmpty(req.body.name))
    return res.json({
      success: false,
      message: "Please Provide Category Name"
    });

  const newCateory = new Category({
    name: req.body.name
  });

  if (req.body.products && Array.isArray(req.body.products)) {
    newCateory.products = req.body.products;
  }

  newCateory
    .save()
    .then(category =>
      res.json({
        success: true,
        message: "Category Created.",
        data: category.id
      })
    )
    .catch(err => {
      if (err.code == 11000) {
        return res.json({
          success: false,
          message: "Please Provide diffrent Category Name"
        });
      }
      if (err.name == "ValidationError") {
        return res.json({
          success: false,
          message: err.name
        });
      }

      return res.json({
        success: false,
        message: err
      });
    });
});

router.get("/categorys", (req, res) => {
  Category.find()
    .sort({
      createdOn: -1
    })
    .populate({ path: "products" })
    .then(cateory => {
      if (cateory.length == 0)
        return (
          res, json({ success: false, message: "No Category is created yet!" })
        );
      res.json({
        success: true,
        data: cateory
      });
    })
    .catch(err =>
      res.status(404).json({
        success: false,
        message: err
      })
    );
});

router.put("/category/:id", (req, res) => {
  if (!req.params.id && !ObjectId.isValid(req.params.id))
    return res.json({
      success: false,
      message: "Please Provide valid id"
    });
  Category.findById(req.params.id)
    .then(catagory => {
      if (!catagory)
        return res.json({
          success: false,
          message: `No Category Found`
        });
      if (req.body.name) catagory.name = req.body.name;
      catagory.updatedAt = Date.now();
      if (req.body.products) catagory.products.unshift(req.body.products);

      catagory
        .save()
        .then(saved =>
          res.json({
            success: true,
            message: catagory
          })
        )
        .catch(err => {
          if (err.code == 11000) {
            return res.json({
              success: false,
              message: "Please Provide diffrent Category Name"
            });
          }
          if (err.name == "ValidationError") {
            return res.json({
              success: false,
              message: err.name
            });
          }

          return res.json({
            success: false,
            message: err
          });
        });
    })
    .catch(err =>
      res.status(404).json({
        success: false,
        message: err
      })
    );
});

module.exports = router;
