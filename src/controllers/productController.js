// external imports

// internal imports
const { default: mongoose } = require("mongoose");
const Product = require("../models/Product");
const responseGenerate = require("../utils/responseGenerate");

// create products
const createProduct = async (req, res, next) => {
  try {
    // req.body
    const body = req.body;
    console.log(body);

    // Check if a file was uploaded

    const product = new Product(body);

    // Save to database
    await product.save();

    return res
      .status(201)
      .json(responseGenerate(product, "Product added successfully!", false));
  } catch (error) {
    next(error);
  }
};

// delete product
const deleteProduct = async (req, res, next) => {
  try {
    // catch id from server
    const { id } = req.params;
    // find from database with id
    const product = await Product.deleteOne({ _id: id });
    // check condition
    if (product.deletedCount) {
      return res
        .status(200)
        .json(responseGenerate(null, "Product Deleted successfully!", false));
    }

    return res
      .status(404)
      .json(responseGenerate(null, "No Product found with this Id!", true));
  } catch (error) {
    next(error);
  }
};

// get all products
const getProducts = async (req, res, next) => {
  try {
    let queries = { ...req.query };

    // Sort, page, limit -> exclude
    const excludeFields = ["search", "category", "sort", "page", "limit"];
    excludeFields.forEach((field) => delete queries[field]);
    console.log(excludeFields);

    // gt, lt, gte, lte
    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );
    queries = JSON.parse(queryString);

    const filters = {
      limit: 10,
    };

    if (req.query.search) {
      const searchText = req.query.search;
      queries.name = { $regex: searchText, $options: "i" };
    }

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      filters.sortBy = sortBy;
      console.log(sortBy);
    }

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      filters.fields = fields;
      console.log(fields);
    }

    if (req.query.page) {
      const { page, limit } = req.query;
      const skip = (page - 1) * parseInt(limit);
      filters.skip = skip;
      filters.limit = parseInt(limit);
    }

    if (req.query.category) {
      const categoryName = req.query.category; // Get category name from query
      queries.category = categoryName;
    }

    const productsQuery = Product.find(queries)
      .skip(filters.skip)
      .limit(filters.limit)
      .select(filters.fields)
      .sort(filters.sortBy)
      .populate("category");

    // Check if 'category' field needs to be populated
    if (req.query.populateCategory) {
      productsQuery.populate("category");
    }

    const products = await productsQuery.exec();

    // const products = await productsQuery.exec();

    return res.json(responseGenerate(products));
  } catch (err) {
    next(err);
  }
};

// single product get
const getProductById = async (req, res, next) => {
  try {
    // find id from server
    const { id } = req.params;
    // server id use find database id
    const product = await Product.findOne({ _id: id });
    // check condition
    if (!product) throw new Error("No product found with this id!");
    return res.json(responseGenerate(product));
  } catch (err) {
    next(err);
  }
};

const getAllProductByShop = async (req, res, next) => {
  try {
    const shopId = req.params.id;
    console.log(shopId);
    const products = await Product.find({ store: shopId }).populate("category");
    return res.json(responseGenerate(products));
  } catch (error) {
    next(error);
  }
};

// exports
module.exports = {
  createProduct,
  deleteProduct,
  getProducts,
  getProductById,
  getAllProductByShop,
};
