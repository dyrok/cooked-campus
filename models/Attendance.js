const mongoose = require("mongoose");

// 1 doc = 1 student, 1 course, 1 day
const attendanceSchema = new mongoose.Schema({
    course:{type:mongoose.Schema.Types.ObjectId, ref:"Course", required:true},  // which course (its _id)
    student:{type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},   // which student (its _id)
    date:{type:String, required:true},   // saved as text like "2026-09-24"
    status:{type:String, enum:["present","absent"], required:true},  // only present or absent
});

const Attendance = mongoose.model("Attendance",attendanceSchema);
module.exports = Attendance;
