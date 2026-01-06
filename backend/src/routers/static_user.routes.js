import { Router } from "express";
import path from "path";

const router = Router();

const __dirname = import.meta.dirname;

router.get("/home", (req, res) => {
  const homePath = path.join(
    __dirname,
    "../../../frontend/templetes/index.html"
  );
  res.sendFile(homePath);
});
export default router;
