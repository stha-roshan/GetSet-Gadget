import { Router } from "express";
import path from "path";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = Router();

const __dirname = import.meta.dirname;

router.get("/home", (req, res) => {
  const homePath = path.join(
    __dirname,
    "../../../frontend/templetes/index.html"
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
    "../../../frontend/templetes/product.html"
  );
  res.sendFile(homePath);
});

router.get("/product-detail", (req, res) => {
  const homePath = path.join(
    __dirname,
    "../../../frontend/templetes/product-detail.html"
  );
  res.sendFile(homePath);
});

router.get("/my-cart", (req, res) => {
  const homePath = path.join(
    __dirname,
    "../../../frontend/templetes/my_cart.html"
  );
  res.sendFile(homePath);
});
export default router;
