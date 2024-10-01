import { Router } from "express";
import {
  hourseCalculation,
  dateRangeHourseCalculation,
  getAttendanceForRFIDS,
  getAttanceNumberOfRFID,
  getAttanceByRFID,
} from "../Controller/admin.controller.js";

const router = Router();

router.route("/gettotalhourse").post(hourseCalculation);
router.route("/gettotalhoursebydaterange").post(dateRangeHourseCalculation);
router.route("/getattanceforrifds").post(getAttendanceForRFIDS);
router.route("/getattancenumberofrifd").post(getAttanceNumberOfRFID);
// router.route("/getattancenumberofrifd").post(getAttanceByRFID);

export default router;
