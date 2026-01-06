import { Router } from "express";
import path from "path";

const router = Router();
const __dirname = import.meta.dirname;

// ############### Dashboard ###############

router.get("/", (req, res) => {
  const pagePath = path.join(
    __dirname,
    "../../../frontend/templetes/dashboard.html"
  );
  res.sendFile(pagePath);
});

// ############### product management ###############

router.get("/product-management", (req, res) => {
  const pagePath = path.join(
    __dirname,
    "../../../frontend/templetes/product_management.html"
  );
  res.sendFile(pagePath);
});

router.get("/create-product", (req, res) => {
  const pagePath = path.join(
    __dirname,
    "../../../frontend/templetes/product_form.html"
  );
  res.sendFile(pagePath);
});


// ############### category management ###############

router.get("/create-category", (req, res) => {
  const pagePath = path.join(
    __dirname,
    "../../../frontend/templetes/category_form.html"
  );
  res.sendFile(pagePath);
});

router.get("/category-management", (req, res) => {
  const pagePath = path.join(
    __dirname,
    "../../../frontend/templetes/category_management.html"
  );
  res.sendFile(pagePath);
})


// ############### brand management ###############

router.get("/create-brand", (req, res) => {
  const pagePath = path.join(
    __dirname,
    "../../../frontend/templetes/brand_form.html"
  );
  res.sendFile(pagePath);
});

router.get("/brand-management", (req, res) => {
  const pagePath = path.join(
    __dirname,
    "../../../frontend/templetes/brand_management.html"
  );
  res.sendFile(pagePath);
});

export default router;
