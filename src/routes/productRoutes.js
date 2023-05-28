// external imports
const router = require("express").Router();
const passport = require("passport");
// internal imports
const {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getAllProductByShop,
  updateProduct,
} = require("../controllers/productController");
const accessControl = require("../accessControl");
const uploader = require("../lib/multer");

// post route
router.post(
  "/",
  // passport.authenticate("jwt", { session: false }),
  // accessControl.grantAccess("createOwn", "product"),
  uploader.array("image", 4),
  createProduct
);
// update
router.put(
  "/:id",
  // passport.authenticate("jwt", { session: false }),
  // accessControl.grantAccess("updateOwn", "product"),
  updateProduct
);
// delete route
router.delete(
  "/:id",
  // passport.authenticate("jwt", { session: false }),
  // accessControl.grantAccess("deleteOwn", "product"),
  deleteProduct
);
// get route
router.get("/get-shop-product/:id", getAllProductByShop);
router.get("/", getProducts);
// get single product route
router.get("/:id", getProductById);

// exports
module.exports = router;
