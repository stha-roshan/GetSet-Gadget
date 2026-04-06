import { Router } from "express";
import path from "path";
import { isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();
const __dirname = import.meta.dirname;

// ############### Dashboard ###############

router.get("/dashboard", isAdmin, (req, res) => {
  const pagePath = path.join(
    __dirname,
    "../../../frontend_v2/admin/templates/admin_dashboard.html"
  );
  res.sendFile(pagePath);
});

// ############### product management ###############

router.get("/product-management", isAdmin, (req, res) => {
  const pagePath = path.join(
    __dirname,
    "../../../frontend_v2/admin/templates/product_management.html"
  );
  res.sendFile(pagePath);
});

router.get("/create-product", isAdmin, (req, res) => {
  const pagePath = path.join(
    __dirname,
    "../../../frontend/templetes/product_form.html"
  );
  res.sendFile(pagePath);
});

router.get("/edit-product", isAdmin, (req, res) => {
  const pagePath = path.join(
    __dirname,
    "../../../frontend_v2/admin/templates/product_edit_info.html"
  );
  res.sendFile(pagePath);
});

// ############### order management ###############
router.get("/order-management", isAdmin,(req, res) => {
  const pagePath = path.join(
    __dirname,
    "../../../frontend_v2/admin/templates/order_management.html"
  );
  res.sendFile(pagePath);
});

router.get("/order-detail", isAdmin, (req, res) => {
  const pagePath = path.join(
    __dirname,
    "../../../frontend_v2/admin/templates/order_detail.html"
  );
  res.sendFile(pagePath);
});

// ############### category management ###############

router.get("/create-category", isAdmin, (req, res) => {
  const pagePath = path.join(
    __dirname,
    "../../../frontend/templetes/category_form.html"
  );
  res.sendFile(pagePath);
});

router.get("/category-management", isAdmin, (req, res) => {
  const pagePath = path.join(
    __dirname,
    "../../../frontend/templetes/category_management.html"
  );
  res.sendFile(pagePath);
})


// ############### brand management ###############

router.get("/create-brand", isAdmin, (req, res) => {
  const pagePath = path.join(
    __dirname,
    "../../../frontend/templetes/brand_form.html"
  );
  res.sendFile(pagePath);
});

router.get("/brand-management", isAdmin, (req, res) => {
  const pagePath = path.join(
    __dirname,
    "../../../frontend/templetes/brand_management.html"
  );
  res.sendFile(pagePath);
});

// ############### signin/ signup ###############

router.get("/signin", (req, res) => {
  const pagePath = path.join(
    __dirname,
    "../../../frontend_v2/admin/templates/admin_login.html"
  );
  res.sendFile(pagePath);
});

export default router;
