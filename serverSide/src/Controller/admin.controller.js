// Model
import { User } from "../Model/user.model.js";
import { AttendanceEntry } from "../Model/attendances.model.js";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";
import fs from "fs";
import puppeteer from "puppeteer";

// Utils
import { apiError } from "../Utils/apiError.utils.js";
import { asyncHandler } from "../Utils/asyncHandler.utils.js";
import { apiResponse } from "../Utils/apiResponse.utils.js";
import { calculateTime } from "../Utils/calculateTime.utils.js";
import { generatePDF } from "../Utils/pdfGenrate.utils.js";
import { genrateHTMLTable } from "../Utils/genrateHTMLTable.utils.js";

const hourseCalculation = asyncHandler(async (req, res) => {
  const { rfid } = req.body;
  const onlyTimeData = [];
  let allTimes = [];

  if (!rfid) {
    throw new apiError(400, "RFID is requried.");
  }
  const date1 = new Date();
  const date2 = new Date();
  date1.setHours(0, 0, 0, 0);
  date2.setHours(23, 59, 59, 999);

  const allTimesWithDate = await AttendanceEntry.aggregate([
    {
      $match: {
        rfid: rfid,
        createdAt: {
          $gte: date1,
          $lte: date2,
        },
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
        rfid: { $first: "$rfid" }, // Keep the rfid for lookup
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "rfid",
        foreignField: "rfid",
        as: "userDetails",
      },
    },
    {
      $unwind: "$userDetails",
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
        fullname: "$userDetails.fullname",
        dayOfWeek: {
          $dayOfWeek: {
            // Add dayOfWeek field
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
        }, // Include the fullname from the joined user details
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
    // console.log("a :_", el);

    allDateData.push(calculateTime(el));
  });

  // console.log(allTimesWithDate);
  // console.log(allDateData);

  allDateData.map((ele) => {
    for (let i = 2; i > 0; i--) {
      while (ele.totalWorkingTime[i] >= 60) {
        ele.totalWorkingTime[i] -= 60;
        ele.totalWorkingTime[i - 1] += 1;
      }
      while (ele.totalBreakTime[i] >= 60) {
        ele.totalBreakTime[i] -= 60;
        ele.totalBreakTime[i - 1] += 1;
      }
    }
  });

  res.json(allTimesWithDate);
  // console.log(allDateData);
  // generatePDF(res, allDateData);

  // const __filename = fileURLToPath(import.meta.url);
  // const __dirname = path.dirname(__filename);

  // return res.status(200).sendFile(path.join(__dirname, "output.pdf"));

  const htmlString = genrateHTMLTable(allDateData);
  // console.log(htmlString);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set HTML content for the page
  await page.setContent(htmlString);

  // Generate PDF from the page content
  const pdfBuffer = await page.pdf({ format: "A4" });

  // Close the browser
  await browser.close();

  // Write the PDF to a file or send as response
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.join(__dirname, "output.pdf");

  fs.writeFileSync(filePath, pdfBuffer);

  return res.status(200).sendFile(filePath);
});

const getAttendanceForRFIDS = asyncHandler(async (req, res) => {
  const { rfids, startDate, endDate } = req.body;

  // console.log(rfids, startDate, endDate);

  const rfid1 = rfids.first;
  const rfid2 = rfids.second;

  if (!rfids) {
    throw new apiError(400, "RFID is requried.");
  }
  if (!startDate && !endDate) {
    throw new apiError(400, "Date rage is requried.");
  }
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  endDateObj.setHours(23, 59, 59, 999);

  let rfid = rfid1;

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
        rfid: { $first: "$rfid" }, // Keep the rfid for lookup
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "rfid",
        foreignField: "rfid",
        as: "userDetails",
      },
    },
    {
      $unwind: "$userDetails",
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
        fullname: "$userDetails.fullname",
        dayOfWeek: {
          $dayOfWeek: {
            // Add dayOfWeek field
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
        }, // Include the fullname from the joined user details
      },
    },
    {
      $sort: {
        date: 1,
      },
    },
  ]);

  // const allTimesWithDate = await AttendanceEntry.aggregate([
  //   {
  //     $match: {
  //       rfid: { $in: [rfid1, rfid2] }, // Match either of the two RFIDs
  //       createdAt: {
  //         $gte: startDateObj,
  //         $lte: endDateObj,
  //       },
  //     },
  //   },
  //   {
  //     $sort: {
  //       createdAt: 1,
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: {
  //         rfid: "$rfid", // Group by RFID as well
  //         year: { $year: "$createdAt" },
  //         month: { $month: "$createdAt" },
  //         day: { $dayOfMonth: "$createdAt" },
  //       },
  //       allEntries: { $push: "$createdAt" },
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "_id.rfid", // Lookup based on the grouped RFID
  //       foreignField: "rfid",
  //       as: "userDetails",
  //     },
  //   },
  //   {
  //     $unwind: "$userDetails",
  //   },
  //   {
  //     $project: {
  //       _id: 0,
  //       rfid: "$_id.rfid", // Include the RFID in the output
  //       date: {
  //         $dateToString: {
  //           format: "%Y-%m-%d",
  //           date: {
  //             $dateFromParts: {
  //               year: "$_id.year",
  //               month: "$_id.month",
  //               day: "$_id.day",
  //             },
  //           },
  //         },
  //       },
  //       allEntries: 1,
  //       fullname: "$userDetails.fullname",
  //       dayOfWeek: {
  //         $dayOfWeek: {
  //           $dateFromParts: {
  //             year: "$_id.year",
  //             month: "$_id.month",
  //             day: "$_id.day",
  //           },
  //         },
  //       },
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: "$rfid", // Group by RFID to get separate objects
  //       records: {
  //         $push: {
  //           date: "$date",
  //           allEntries: "$allEntries",
  //           fullname: "$fullname",
  //           dayOfWeek: "$dayOfWeek",
  //         },
  //       },
  //     },
  //   },
  //   {
  //     $sort: {
  //       _id: 1,
  //     },
  //   },
  // ]);

  console.log(allTimesWithDate);

  let allDateData = [];

  allTimesWithDate.map((el) => {
    allDateData.push(calculateTime(el));
  });

  // console.log(allTimesWithDate);

  allDateData.map((ele) => {
    for (let i = 2; i > 0; i--) {
      while (ele.totalWorkingTime[i] >= 60) {
        ele.totalWorkingTime[i] -= 60;
        ele.totalWorkingTime[i - 1] += 1;
      }
      while (ele.totalBreakTime[i] >= 60) {
        ele.totalBreakTime[i] -= 60;
        ele.totalBreakTime[i - 1] += 1;
      }
    }
  });
  console.log(allTimesWithDate);

  const htmlString = genrateHTMLTable(allDateData);
  // console.log(htmlString);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set HTML content for the page
  await page.setContent(htmlString);

  // Generate PDF from the page content
  const pdfBuffer = await page.pdf({ format: "A4" });

  // Close the browser
  await browser.close();

  // Write the PDF to a file or send as response
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.join(__dirname, "output.pdf");

  fs.writeFileSync(filePath, pdfBuffer);

  return res.status(200).sendFile(filePath);
});

const getAttanceNumberOfRFID = asyncHandler(async (req, res) => {
  const { rfids, startDate, endDate } = req.body;

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  endDateObj.setHours(23, 59, 59, 999);

  const allData = await AttendanceEntry.aggregate([
    {
      $match: {
        rfid: { $in: rfids },
        createdAt: {
          $gte: startDateObj,
          $lte: endDateObj,
        },
      },
    },
    {
      // Add fields for date and day of the week from createdAt
      $addFields: {
        createdAtDate: {
          $dateToString: {
            format: "%Y-%m-%d", // Extract only the date part
            date: "$createdAt",
            timezone: "Asia/Kolkata", // Indian Time Zone (IST)
          },
        },
        dayOfWeek: {
          $dayOfWeek: "$createdAt", // Get the day of the week as a number (1=Monday, 7=Sunday)
        },
      },
    },
    {
      // Group by rfid and date
      $group: {
        _id: {
          rfid: "$rfid",
          date: "$createdAtDate",
          dayOfWeek: "$dayOfWeek",
        },
        count: { $sum: 1 },
        entries: { $push: "$createdAt" },
      },
    },
    {
      // Group again by rfid to collect all daily entries
      $group: {
        _id: "$_id.rfid",
        dailyEntries: {
          $push: {
            date: "$_id.date",
            dayOfWeek: "$_id.dayOfWeek",
            count: "$count",
            entries: "$entries",
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "rfid",
        as: "userDetails",
      },
    },
    {
      $unwind: "$userDetails",
    },
    {
      $addFields: {
        dailyEntries: {
          $map: {
            input: {
              $sortArray: { input: "$dailyEntries", sortBy: { date: 1 } },
            }, // Sort dailyEntries by date
            as: "entry",
            in: "$$entry",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        fullname: "$userDetails.fullname",
        dailyEntries: 1,
        week: { $week: startDateObj },
      },
    },
  ]);

  let allDateData = [];

  allData.map((el, idx) => {
    allDateData.push({
      name: el.fullname,
      AttendanceEntry: [],
    });
    // console.log(el.fullname);

    el.dailyEntries.map((el2, ndx) => {
      // console.log(el2);
      allDateData[idx].AttendanceEntry.push(calculateTime(el2));
    });
  });

  allDateData.map((el, idx) => {
    el.AttendanceEntry.map((el2, ndx) => {
      for (let i = 2; i > 0; i--) {
        while (el2.totalWorkingTime[i] >= 60) {
          el2.totalWorkingTime[i] -= 60;
          el2.totalWorkingTime[i - 1] += 1;
        }
        while (el2.totalBreakTime[i] >= 60) {
          el2.totalBreakTime[i] -= 60;
          el2.totalBreakTime[i - 1] += 1;
        }
      }
    });
  });

  const htmlString = genrateHTMLTable(
    allDateData,
    allData[0].week,
    startDate,
    endDate
  );

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set HTML content for the page
  await page.setContent(htmlString);

  // Generate PDF from the page content
  const pdfBuffer = await page.pdf({ format: "A4" });

  // Close the browser
  await browser.close();

  // Write the PDF to a file or send as response
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.join(__dirname, "output.pdf");

  fs.writeFileSync(filePath, pdfBuffer);

  return res.status(200).sendFile(filePath);
});

const getAttanceByRFID = asyncHandler(async (req, res) => {
  const { rfids, startDate, endDate } = req.body;

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  endDateObj.setHours(23, 59, 59, 999);

  const allData = await AttendanceEntry.aggregate([
    {
      $match: {
        rfid: { $in: rfids },
        createdAt: {
          $gte: startDateObj,
          $lte: endDateObj,
        },
      },
    },
    {
      // Add fields for date and day of the week from createdAt
      $addFields: {
        createdAtDate: {
          $dateToString: {
            format: "%Y-%m-%d", // Extract only the date part
            date: "$createdAt",
            timezone: "Asia/Kolkata", // Indian Time Zone (IST)
          },
        },
        dayOfWeek: {
          $dayOfWeek: "$createdAt", // Get the day of the week as a number (1=Monday, 7=Sunday)
        },
      },
    },
    {
      // Group by rfid and date
      $group: {
        _id: {
          rfid: "$rfid",
          date: "$createdAtDate",
          dayOfWeek: "$dayOfWeek",
        },
        count: { $sum: 1 },
        entries: { $push: "$createdAt" },
      },
    },
    {
      // Group again by rfid to collect all daily entries
      $group: {
        _id: "$_id.rfid",
        dailyEntries: {
          $push: {
            date: "$_id.date",
            dayOfWeek: "$_id.dayOfWeek",
            count: "$count",
            entries: "$entries",
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "rfid",
        as: "userDetails",
      },
    },
    {
      $unwind: "$userDetails",
    },
    {
      $addFields: {
        dailyEntries: {
          $map: {
            input: {
              $sortArray: { input: "$dailyEntries", sortBy: { date: 1 } },
            }, // Sort dailyEntries by date
            as: "entry",
            in: "$$entry",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        fullname: "$userDetails.fullname",
        dailyEntries: 1,
      },
    },
  ]);

  let allDateData = [];

  allData.map((el, idx) => {
    allDateData.push({
      name: el.fullname,
      AttendanceEntry: [],
    });
    console.log(el.fullname);

    el.dailyEntries.map((el2, ndx) => {
      // allDateData[idx].AttendanceEntry.push(calculateTime(el2));
      console.log(allDateData[idx].AttendanceEntry.push(calculateTime(el2)));
    });
  });

  allDateData.map((el, idx) => {
    el.AttendanceEntry.map((el2, ndx) => {
      for (let i = 2; i > 0; i--) {
        while (el2.totalWorkingTime[i] >= 60) {
          el2.totalWorkingTime[i] -= 60;
          el2.totalWorkingTime[i - 1] += 1;
        }
        while (el2.totalBreakTime[i] >= 60) {
          el2.totalBreakTime[i] -= 60;
          el2.totalBreakTime[i - 1] += 1;
        }
      }
    });
  });

  const htmlString = genrateHTMLTable(allDateData);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set HTML content for the page
  await page.setContent(htmlString);

  // Generate PDF from the page content
  const pdfBuffer = await page.pdf({ format: "A4" });

  // Close the browser
  await browser.close();

  // Write the PDF to a file or send as response
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.join(__dirname, "output.pdf");

  fs.writeFileSync(filePath, pdfBuffer);

  return res.status(200).sendFile(filePath);
});

export {
  hourseCalculation,
  dateRangeHourseCalculation,
  getAttendanceForRFIDS,
  getAttanceNumberOfRFID,
  getAttanceByRFID,
};
