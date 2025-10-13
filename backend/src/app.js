import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());

// ########## import routes ##########

import userRoutes from "./routers/user.routes.js";

// ########## implement routes ##########

app.use("/api/users", userRoutes);

export { app };
