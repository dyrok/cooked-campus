// express, Result model n role chk
const express = require("express");
const Result = require("../models/Result");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// POST /results -> faculty or admin enters marks
// entering again for same student + course just updates it
router.post('/', allowRoles("faculty","admin"), async(req,res)=>{
    try{
        // student, course n marks r must (marks can be 0 so chk undefined/empty)
        const { student, course, marks } = req.body;
        if(!student || !course || marks === undefined || marks === ""){
            return res.status(400).json({ message:"student, course and marks are required" });
        }
        // marks only 0 to 100
        if(marks < 0 || marks > 100){
            return res.status(400).json({ message:"marks must be between 0 and 100" });
        }
        // find by student + course, update marks, not there -> create (upsert)
        const result = await Result.findOneAndUpdate(
            { student: student, course: course },
            { marks: marks },
            { upsert: true, new: true }
        );
        res.status(201).json(result);
    }catch(error){
        res.status(500).json({
            message:"Failed to save result",
            error:error.message
        });
    }
})

// GET /results -> student sees own, faculty/admin use ?course=<id>
router.get("/", async (req, res) => {
  try {
    const filter = {};
    // student -> always only their own (ignore anything in url)
    // others -> filter by course if given
    if (req.user.role === "student") {
      filter.student = req.user.userId;
    } else if (req.query.course) {
      filter.course = req.query.course;
    }
    // swap ids w/ student name n course code
    const results = await Result.find(filter)
      .populate("student", "name rollNo")
      .populate("course", "code title");
    res.json(results);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch results",
    });
  }
});

module.exports = router;
