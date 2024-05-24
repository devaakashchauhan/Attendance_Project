import { Router } from "express";
import { respon } from "../Controller/user.controller.js";

const router = Router();

router.route("/attendances").post(respon);

export default router;
