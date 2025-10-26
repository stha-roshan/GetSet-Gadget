import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());

// ########## import routes ##########

import userRoutes from "./routers/user.routes.js";
import addressRoutes from "./routers/address.routes.js";

// ########## implement routes ##########

app.use("/api/users", userRoutes);
app.use("/api/address", addressRoutes);

export { app };
