import { Router } from "express";
import {
  hourseCalculation,
  dateRangeHourseCalculation,
} from "../Controller/admin.controller.js";

const router = Router();

router.route("/gettotalhourse").post(hourseCalculation);
router.route("/gettotalhoursebydaterange").post(dateRangeHourseCalculation);

export default router;
