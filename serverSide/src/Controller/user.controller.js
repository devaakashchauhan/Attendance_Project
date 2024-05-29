// Model
import { User } from "../Model/user.model.js";
import { AttendanceEntry } from "../Model/attendances.model.js";

// Utils
import { apiError } from "../Utils/apiError.utils.js";
import { asyncHandler } from "../Utils/asyncHandler.utils.js";
import { apiResponse } from "../Utils/apiResponse.utils.js";

const attendance = asyncHandler(async (req, res) => {
  const { rfid } = req.body;
  console.log(rfid);

  if (!rfid) {
    throw new apiError(400, "RFID is requried.");
  }

  const date = new Date();

  const startOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const endOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1
  );
  // console.log(startOfDay);
  // console.log(endOfDay);

  let count = await AttendanceEntry.countDocuments({
    rfid: rfid,
    createdAt: { $gte: startOfDay, $lt: endOfDay },
  });

  const attendancesEntry = await AttendanceEntry.create({
    rfid,
    entryType: count % 2 !== 0 ? "Exit" : "Entery",
    entryNumber: count,
  });

  if (!attendancesEntry) {
    throw new apiError(500, "Error while attandance entry.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, rfid, "Attendance entry created succesfully."));
});

const userRegisteration = asyncHandler(async (req, res) => {
  const { rfid } = req.body;

  const exitedUser = await User.findOne({ rfid });

  if (exitedUser) {
    throw new apiError(400, "username  already exists !!!");
  }

  const user = await User.create({
    rfid: 2758330620,
    fullname: "Saalim Shaikh",
    email: "saalim2470@gmail.com",
    role: "Software Developer",
  });
  return res.status(200);
});

export { attendance, userRegisteration };
