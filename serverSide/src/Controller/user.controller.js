// Model
import { User } from "../Model/user.model.js";
import { AttendanceEntry } from "../Model/attendances.model.js";

// Utils
import { apiError } from "../Utils/apiError.utils.js";
import { asyncHandler } from "../Utils/asyncHandler.utils.js";
import { apiResponse } from "../Utils/apiResponse.utils.js";

const respon = asyncHandler(async (req, res) => {
  const { rfid } = req.body;

  if (!rfid) {
    throw new apiError(400, "RFID is requried.");
  }
  const d = new Date();

  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  const hourse = d.getHours();
  const minutes = d.getMinutes();
  const second = d.getSeconds();
  // console.log(time);

  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  // console.log(startOfDay);
  // console.log(endOfDay);

  let count = await AttendanceEntry.countDocuments({
    rfid: rfid,
    createdAt: { $gte: startOfDay, $lt: endOfDay },
  });

  console.log(count);

  const attendancesEntry = await AttendanceEntry.create({
    rfid,
    entryType: count % 2 !== 0 ? "Exit" : "Entery",
    entryNumber: count,
    entryTime: `${hourse}:${minutes}:${second}`,
  });

  if (!attendancesEntry) {
    throw new apiError(500, "Error while attandance entry.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, rfid, "Attendance entry created succesfully."));
});

export { respon };
