// express, mongoose (for ObjectId), models n role chk
const express = require("express");
const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const Course = require("../models/Course");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// POST /attendance/mark -> faculty (or admin) marks attendance for 1 course on 1 date
// body looks like: { courseId, date, records: [ { studentId, status } ] }
router.post('/mark', allowRoles("faculty","admin"), async(req,res)=>{
    try{
        // chk everything is sent n records isnt empty
        const { courseId, date, records } = req.body;
        if(!courseId || !date || !records || records.length === 0){
            return res.status(400).json({
                message:"courseId, date and records are required"
            });
        }
        // find the course, not there -> 404
        const course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({ message:"Course not found" });
        }
        // faculty can only mark their own course, else 403
        if(req.user.role === "faculty" && String(course.faculty) !== req.user.userId){
            return res.status(403).json({ message:"This is not your course" });
        }

        // go thru each student one by one
        for (const r of records) {
            // already marked for that day -> update it, else make new one (upsert)
            await Attendance.findOneAndUpdate(
                { course: courseId, student: r.studentId, date: date },
                { status: r.status },
                { upsert: true }
            );
        }
        res.status(201).json({ message:"Attendance saved for " + records.length + " students" });
    }catch(error){
        res.status(500).json({
            message:"Failed to mark attendance",
            error:error.message
        });
    }
})

// GET /attendance?courseId=..&date=2026-09-24 -> faculty, admin, hod
// gives whats already marked that day (used to pre-fill the form)
router.get("/", allowRoles("faculty","admin","hod"), async (req, res) => {
  try {
    // find records for that course + date
    const records = await Attendance.find({
      course: req.query.courseId,
      date: req.query.date,
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch attendance",
    });
  }
});

// GET /attendance/my -> student sees their own % in every course
router.get("/my", allowRoles("student"), async (req, res) => {
  try {
    // get all my records n swap course id w/ course code + title
    const records = await Attendance.find({ student: req.user.userId }).populate("course", "code title");

    // count present n total per course, key = course code
    const summary = {};
    for (const r of records) {
      const code = r.course.code;
      // first time seeing this course -> start its counters at 0
      if (!summary[code]) {
        summary[code] = { code: code, title: r.course.title, present: 0, total: 0 };
      }
      summary[code].total++;
      if (r.status === "present") {
        summary[code].present++;
      }
    }

    // turn object into array n add % to each course
    const result = Object.values(summary).map((s) => {
      s.percent = Math.round((s.present / s.total) * 100);
      return s;
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch attendance",
    });
  }
});

// GET /attendance/dashboard/:courseId -> faculty, hod, admin
// faculty dashboard: % of every student in a course + at-risk list
// uses aggregation: $match -> $group -> $lookup -> $project
router.get("/dashboard/:courseId", allowRoles("faculty","hod","admin"), async (req, res) => {
  try {
    const data = await Attendance.aggregate([
      // $match = only keep records of this course (id must be ObjectId here)
      { $match: { course: new mongoose.Types.ObjectId(req.params.courseId) } },
      // $group = one row per student, count total classes n present ones
      // $cond -> if status is present add 1 else add 0
      {
        $group: {
          _id: "$student",
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
        },
      },
      // $lookup = join w/ users collection to get the student's details
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      // $lookup gives an array, $unwind makes it a single object
      { $unwind: "$student" },
      // $project = pick fields to send + calc percent (present/total*100)
      {
        $project: {
          name: "$student.name",
          rollNo: "$student.rollNo",
          total: 1,
          present: 1,
          percent: { $round: [{ $multiply: [{ $divide: ["$present", "$total"] }, 100] }, 0] },
        },
      },
      // $sort = lowest % first so at-risk ppl show on top
      { $sort: { percent: 1 } },
    ]);

    // at risk = below 75%
    const atRisk = data.filter((s) => s.percent < 75);
    // class average = add all % n divide by no. of students
    let classAverage = 0;
    if (data.length > 0) {
      let sum = 0;
      data.forEach((s) => (sum += s.percent));
      classAverage = Math.round(sum / data.length);
    }

    // send everything to the dashboard
    res.json({
      students: data,
      atRisk: atRisk,
      classAverage: classAverage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load dashboard",
    });
  }
});

module.exports = router;
