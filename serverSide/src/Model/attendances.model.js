import mongoose, { Schema } from "mongoose";

const attendancesSchema = new Schema(
  {
    rfid: {
      type: String,
    },
    entryType: {
      type: String,
      required: true,
      trim: true,
    },
    entryNumber: {
      type: Number,
      required: true,
      default: 0,
    },
    entryTime: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const AttendanceEntry = mongoose.model(
  "AttendanceEntry",
  attendancesSchema
);
