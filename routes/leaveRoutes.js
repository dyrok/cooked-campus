// express, Leave model n role chk
const express = require("express");
const Leave = require("../models/Leave");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// POST /leaves -> student or faculty applies for leave
router.post('/', allowRoles("student","faculty"), async(req,res)=>{
    try{
        // all 3 fields r must
        const { fromDate, toDate, reason } = req.body;
        if(!fromDate || !toDate || !reason){
            return res.status(400).json({ message:"fromDate, toDate and reason are required" });
        }
        // from date cant be after to date (dates r "yyyy-mm-dd" so string compare works)
        if(fromDate > toDate){
            return res.status(400).json({ message:"fromDate cannot be after toDate" });
        }
        // save w/ applicant id + dept from token, status starts as pending
        const leave = await Leave.create({
            applicant: req.user.userId,
            department: req.user.department,
            fromDate: fromDate,
            toDate: toDate,
            reason: reason,
        });
        res.status(201).json(leave);
    }catch(error){
        res.status(500).json({
            message:"Failed to apply leave",
            error:error.message
        });
    }
})

// GET /leaves -> student/faculty see own, hod sees dept, admin sees all
router.get("/", async (req, res) => {
  try {
    const filter = {};
    // student or faculty -> only their own leaves
    if (req.user.role === "student" || req.user.role === "faculty") {
      filter.applicant = req.user.userId;
    }
    // hod -> only their dept
    if (req.user.role === "hod") {
      filter.department = req.user.department;
    }
    // get applicant name + role too
    const leaves = await Leave.find(filter).populate("applicant", "name role");
    res.json(leaves);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch leaves",
    });
  }
});

// PUT /leaves/:id -> hod or admin approves / rejects
router.put("/:id", allowRoles("hod","admin"), async (req, res) => {
  try {
    // status must be approved or rejected, nothing else
    if (req.body.status !== "approved" && req.body.status !== "rejected") {
      return res.status(400).json({ message: "status must be approved or rejected" });
    }
    // update n get back the new doc
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    // wrong id -> 404
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }
    res.json(leave);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update leave",
    });
  }
});

module.exports = router;
