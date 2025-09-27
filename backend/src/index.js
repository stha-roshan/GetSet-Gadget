import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
  debug: true,
});

import { connectDB } from "./db/db.js";
import { app } from "./app.js";

const startserver = async () => {
  try {
    await connectDB();
    console.log(
      `\n[START-SERVER] [index.js] MongoDB Connection established Successfully!`
    );

    app.listen(process.env.PORT, () => {
      console.log(
        `SERVER is up and running on http://localhost:${process.env.PORT}\n`
      );
    });
  } catch (error) {
    console.error(
      `[START-SERVER] [index.js] Failed to start server :: ${error.message}`
    );
    if (process.env.NODE_ENV == "development") {
      console.error(error.stack);
    }
    process.exit(1);
  }
};

startserver();
