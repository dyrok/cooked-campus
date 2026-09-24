// express, Assignment + Course models n role chk
const express = require("express");
const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// POST /assignments -> faculty creates an assignment
router.post('/', allowRoles("faculty"), async(req,res)=>{
    try{
        // course n title r must
        const { course, title } = req.body;
        if(!course || !title){
            return res.status(400).json({ message:"course and title are required" });
        }
        // save who made it (the logged in faculty) n create it
        req.body.createdBy = req.user.userId;
        const assignment = await Assignment.create(req.body);
        res.status(201).json(assignment);
    }catch(error){
        res.status(500).json({
            message:"Failed to add assignment",
            error:error.message
        });
    }
})

// GET /assignments -> faculty sees what they made, student sees their courses ones
router.get("/", async (req, res) => {
  try {
    const filter = {};
    // faculty -> only ones they created
    if (req.user.role === "faculty") {
      filter.createdBy = req.user.userId;
    }
    // student -> find their courses (dept + sem) first
    // then only assignments whose course is in that list ($in)
    if (req.user.role === "student") {
      const courses = await Course.find({
        department: req.user.department,
        semester: req.user.semester,
      });
      filter.course = { $in: courses.map((c) => c._id) };
    }
    // populate course code n submitted student names
    const assignments = await Assignment.find(filter)
      .populate("course", "code title")
      .populate("submissions.student", "name rollNo");
    res.json(assignments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch assignments",
    });
  }
});

// POST /assignments/:id/submit -> student submits (or re-submits) answer
router.post('/:id/submit', allowRoles("student"), async(req,res)=>{
    try{
        // empty answer -> 400
        if(!req.body.answer){
            return res.status(400).json({ message:"answer is required" });
        }
        // find the assignment, not there -> 404
        const assignment = await Assignment.findById(req.params.id);
        if(!assignment){
            return res.status(404).json({ message:"Assignment not found" });
        }
        // chk if this student already submitted before
        const old = assignment.submissions.find((s) => String(s.student) === req.user.userId);
        // yes -> just update answer n time, no -> push a new submission
        if(old){
            old.answer = req.body.answer;
            old.submittedAt = Date.now();
        }else{
            assignment.submissions.push({ student: req.user.userId, answer: req.body.answer });
        }
        // save changes to db
        await assignment.save();
        res.json({ message:"Submitted" });
    }catch(error){
        res.status(500).json({
            message:"Failed to submit",
            error:error.message
        });
    }
})

module.exports = router;
