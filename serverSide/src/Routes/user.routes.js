import { Router } from "express";
import {
  attendance,
  userRegisteration,
} from "../Controller/user.controller.js";

const router = Router();

router.route("/attendances").post(attendance);
router.route("/res").get(userRegisteration);

export default router;
