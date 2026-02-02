import express from "express";
import cookieParser from "cookie-parser";
import path from "path";

const app = express();
const __dirname = import.meta.dirname;

app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../../frontend_v2/user")));
app.use(express.static(path.join(__dirname, "../../frontend")));


// ########## import routes ##########

import userRoutes from "./routers/user.routes.js";
import addressRoutes from "./routers/address.routes.js";
import categoryRoutes from "./routers/category.routes.js";
import productRoutes from "./routers/product.routes.js";
import brandRoutes from "./routers/brand.routes.js";
import cartRoutes from "./routers/cart.routes.js"
import userStaticRoutes from "./routers/static_user.routes.js";
import adminStaticRoutes from "./routers/static_admin.routes.js";
import cryptoRoutes from "./routers/crypto.routes.js";
import orderRoutes from "./routers/order.routes.js";

// ########## implement routes ##########

app.use("/api/users", userRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/cart", cartRoutes)
app.use("/", userStaticRoutes);
app.use("/admin", adminStaticRoutes);
app.use("/api/crypto", cryptoRoutes);
app.use("/api/orders", orderRoutes);

export { app };
