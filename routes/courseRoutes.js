// express, Course + User models n role chk
const express = require("express");
const Course = require("../models/Course");
const User = require("../models/User");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// POST /courses -> admin or hod adds a course (n picks a faculty)
router.post('/', allowRoles("admin","hod"), async(req,res)=>{
    try{
        // chk required fields, missing -> 400
        const { code, title, department, semester } = req.body;
        if(!code || !title || !department || !semester){
            return res.status(400).json({
                message:"code, title, department and semester are required"
            });
        }
        // hod can only add courses in own dept, so overwrite dept
        if(req.user.role === "hod"){
            req.body.department = req.user.department;
        }
        // no faculty picked -> remove the empty value so mongo dont complain
        if(!req.body.faculty){
            delete req.body.faculty;
        }
        // save course n send it back
        const course = await Course.create(req.body);
        res.status(201).json(course);
    }catch(error){
        res.status(500).json({
            message:"Failed to add course",
            error:error.message
        });
    }
})

// GET /courses -> everyone, but each role only sees their own courses
router.get("/", async (req, res) => {
  try {
    const filter = {};
    // faculty -> only courses they teach
    if (req.user.role === "faculty") {
      filter.faculty = req.user.userId;
    }
    // hod -> only their dept courses
    if (req.user.role === "hod") {
      filter.department = req.user.department;
    }
    // student -> courses of their dept + sem
    if (req.user.role === "student") {
      filter.department = req.user.department;
      filter.semester = req.user.semester;
    }
    // optional search by title
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: "i" };
    }
    // populate = swap faculty id w/ the faculty's name
    const courses = await Course.find(filter).populate("faculty", "name");
    res.json(courses);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch courses",
    });
  }
});

// GET /courses/:id/students -> admin, hod, faculty get students of a course
// (students w/ same dept + sem as the course)
router.get("/:id/students", allowRoles("admin","hod","faculty"), async (req, res) => {
  try {
    // find the course first, not there -> 404
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    // get students matching course dept n sem, only name + roll no
    const students = await User.find({
      role: "student",
      department: course.department,
      semester: course.semester,
    }).select("name rollNo");
    res.json(students);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch students",
    });
  }
});

module.exports = router;
