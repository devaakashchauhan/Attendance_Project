import { Router } from "express";
import { respon, userRegisteration } from "../Controller/user.controller.js";

const router = Router();

router.route("/attendances").post(respon);
router.route("/res").get(userRegisteration);

export default router;
