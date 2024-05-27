// Model
import { User } from "../Model/user.model.js";
import { AttendanceEntry } from "../Model/attendances.model.js";
import path from "path";
import { fileURLToPath } from "url";

// Utils
import { apiError } from "../Utils/apiError.utils.js";
import { asyncHandler } from "../Utils/asyncHandler.utils.js";
import { apiResponse } from "../Utils/apiResponse.utils.js";
import { calculateTime } from "../Utils/calculateTime.utils.js";
import { generatePDF } from "../Utils/pdfGenrate.utils.js";

const hourseCalculation = asyncHandler(async (req, res) => {
  const { rfid } = req.body;
  const onlyTimeData = [];
  let allTimes = [];

  if (!rfid) {
    throw new apiError(400, "RFID is requried.");
  }

  const allTimesWithDate = await AttendanceEntry.aggregate([
    {
      $match: {
        rfid: rfid,
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
    {
      $project: {
        time: "$createdAt",
      },
    },
  ]);

  allTimesWithDate.map((el) => {
    onlyTimeData.push(el.time);
  });
  // console.log(onlyTimeData);

  if (onlyTimeData.length % 2 !== 0) {
    onlyTimeData.pop();
  }

  const l = onlyTimeData.length;

  for (let i = 0; i < l - 1; i++) {
    let entryTimeInSecondFormat = onlyTimeData[i].getTime() / 1000;
    let exitTimeInSecondFormat = onlyTimeData[i + 1].getTime() / 1000;
    let totalTimeDifferentInSeconds =
      exitTimeInSecondFormat - entryTimeInSecondFormat;

    let time = timeCaculation(totalTimeDifferentInSeconds);
    allTimes.push(time);
  }

  function timeCaculation(totalTimeDifferentInSeconds) {
    // Hour calculation
    let totalTimeInHourFormat = totalTimeDifferentInSeconds / 3600;
    let onlyHour = Math.floor(totalTimeInHourFormat);

    // Minutes calculation
    let totalTimeWithoutHour = totalTimeInHourFormat - onlyHour;
    let totalTimeInMinutesFormat = totalTimeWithoutHour * 60;

    // Second calculation
    let onlyMinutes = Math.floor(totalTimeInMinutesFormat);
    let onlySeconds = Math.ceil((totalTimeInMinutesFormat - onlyMinutes) * 60);

    let time = [onlyHour, onlyMinutes, onlySeconds];
    return time;
  }

  return res
    .status(200)
    .json(new apiResponse(200, { allTimes }, "Employess total hourse."));
});

// const dateRangeHourseCalculation = asyncHandler(async (req, res) => {
//   const { rfid, startDate, endDate } = req.body;

//   if (!rfid) {
//     throw new apiError(400, "RFID is requried.");
//   }
//   if (!startDate && !endDate) {
//     throw new apiError(400, "Date rage is requried.");
//   }
//   const startDateObj = new Date(startDate);
//   const endDateObj = new Date(endDate);
//   endDateObj.setHours(23, 59, 59, 999);

//   const allTimesWithDate = await AttendanceEntry.aggregate([
//     {
//       $match: {
//         rfid: rfid,
//         createdAt: {
//           $gte: startDateObj,
//           $lte: endDateObj,
//         },
//       },
//     },
//     {
//       $sort: {
//         createdAt: 1,
//       },
//     },
//     {
//       $group: {
//         _id: {
//           year: { $year: "$createdAt" },
//           month: { $month: "$createdAt" },
//           day: { $dayOfMonth: "$createdAt" },
//         },
//         allEntries: { $push: "$createdAt" },
//       },
//     },
//     {
//       $project: {
//         _id: 0,
//         date: {
//           $dateToString: {
//             format: "%Y-%m-%d",
//             date: {
//               $dateFromParts: {
//                 year: "$_id.year",
//                 month: "$_id.month",
//                 day: "$_id.day",
//               },
//             },
//           },
//         },
//         allEntries: 1,
//       },
//     },
//     {
//       $sort: {
//         date: 1,
//       },
//     },
//   ]);

//   let allDateData = [];

//   allTimesWithDate.map((el) => {
//     allDateData.push(calculateTime(el));
//   });
//   // console.table(allDateData);
//   generatePDF(res);

//   return res
//     .status(200)
//     .json(new apiResponse(200, { allDateData }, "Employess total hourse."));
// });

const dateRangeHourseCalculation = asyncHandler(async (req, res) => {
  const { rfid, startDate, endDate } = req.body;

  if (!rfid) {
    throw new apiError(400, "RFID is requried.");
  }
  if (!startDate && !endDate) {
    throw new apiError(400, "Date rage is requried.");
  }
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  endDateObj.setHours(23, 59, 59, 999);

  const allTimesWithDate = await AttendanceEntry.aggregate([
    {
      $match: {
        rfid: rfid,
        createdAt: {
          $gte: startDateObj,
          $lte: endDateObj,
        },
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        allEntries: { $push: "$createdAt" },
      },
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day",
              },
            },
          },
        },
        allEntries: 1,
      },
    },
    {
      $sort: {
        date: 1,
      },
    },
  ]);

  let allDateData = [];

  allTimesWithDate.map((el) => {
    allDateData.push(calculateTime(el));
  });
  // console.table();
  generatePDF(res, allDateData);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  return res.status(200).sendFile(path.join(__dirname, "output.pdf"));
});

export { hourseCalculation, dateRangeHourseCalculation };
