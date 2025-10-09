import express from "express";

const app = express();

// ########## import routes ##########

import userRoutes from "./routers/user.routes.js";

// ########## implement routes ##########

app.use("/api/users", userRoutes);

export { app };
