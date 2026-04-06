import { Router } from "express";
import path from "path";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = Router();

const __dirname = import.meta.dirname;

router.get("/home", (req, res) => {
  const homePath = path.join(
    __dirname,
    "../../../frontend_v2/user/templates/index.html"
  );
  res.sendFile(homePath);
});

router.get("/login", (req, res) => {
  const homePath = path.join(
    __dirname,
    "../../../frontend/templetes/user_login.html"
  );
  res.sendFile(homePath);
});

router.get("/signup", (req, res) => {
  const homePath = path.join(
    __dirname,
    "../../../frontend/templetes/user_register.html"
  );
  res.sendFile(homePath);
});

router.get("/products", (req, res) => {
  const homePath = path.join(
    __dirname,
    "../../../frontend_v2/user/templates/products.html"
  );
  res.sendFile(homePath);
});

router.get("/product-detail", (req, res) => {
  const homePath = path.join(
    __dirname,
    "../../../frontend_v2/user/templates/product_detail.html"
  );
  res.sendFile(homePath);
});

router.get("/my-cart", (req, res) => {
  const homePath = path.join(
    __dirname,
    "../../../frontend_v2/user/templates/cart.html"
  );
  res.sendFile(homePath);
});

router.get("/my-orders", verifyUser, (req, res) => {
  const homePath = path.join(
    __dirname,
    "../../../frontend_v2/user/templates/my_orders.html"
  );
  res.sendFile(homePath);
});


router.get("/checkout", verifyUser, (req, res) => {
  const pagePath = path.join(
    __dirname,
    "../../../frontend_v2/user/templates/checkout.html"
  );
  res.sendFile(pagePath);
});


router.get("/payment-success", (req, res) => {
  const pagePath = path.join(
    __dirname,
    "../../../frontend_v2/user/templates/payment_success.html"
  );
  res.sendFile(pagePath);
});

router.get("/payment-failure",  (req, res) => {
  const pagePath = path.join(
    __dirname,
    "../../../frontend_v2/user/templates/payment_failure.html"
  );
  res.sendFile(pagePath);
}); 



// router.get("/checkout", verifyUser, (req, res) => {
//   const pagePath = path.join(
//     __dirname,
//     "../../../frontend_v2/user/templates/checkout.html"
//   );
//   res.sendFile(pagePath);
// });


export default router;
