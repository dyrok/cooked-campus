// express, Complaint model n role chk
const express = require("express");
const Complaint = require("../models/Complaint");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// POST /complaints -> student raises a complaint
router.post('/', allowRoles("student"), async(req,res)=>{
    try{
        // subject n text r must
        const { subject, text } = req.body;
        if(!subject || !text){
            return res.status(400).json({ message:"subject and text are required" });
        }
        // save it w/ student id + dept from the token (so hod can see it)
        const complaint = await Complaint.create({
            student: req.user.userId,
            department: req.user.department,
            subject: subject,
            text: text,
        });
        res.status(201).json(complaint);
    }catch(error){
        res.status(500).json({
            message:"Failed to add complaint",
            error:error.message
        });
    }
})

// GET /complaints -> student sees own, hod sees dept, admin sees all
router.get("/", allowRoles("student","hod","admin"), async (req, res) => {
  try {
    const filter = {};
    // student -> only their own
    if (req.user.role === "student") {
      filter.student = req.user.userId;
    }
    // hod -> only their dept
    if (req.user.role === "hod") {
      filter.department = req.user.department;
    }
    // optional filter by status eg ?status=open
    if (req.query.status) {
      filter.status = req.query.status;
    }
    // get student name, newest first
    const complaints = await Complaint.find(filter)
      .populate("student", "name rollNo")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch complaints",
    });
  }
});

// PUT /complaints/:id -> hod or admin changes status
router.put("/:id", allowRoles("hod","admin"), async (req, res) => {
  try {
    // only these 3 status values r allowed, else 400
    const allowed = ["open", "in-progress", "resolved"];
    if (!allowed.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    // update status, new:true = give back the updated doc
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    // wrong id -> 404
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.json(complaint);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update complaint",
    });
  }
});

module.exports = router;
