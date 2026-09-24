// express, Event model n role chk
const express = require("express");
const Event = require("../models/Event");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// POST /events -> admin, hod, faculty add an event
router.post('/', allowRoles("admin","hod","faculty"), async(req,res)=>{
    try{
        // title n date r must
        const { title, date } = req.body;
        if(!title || !date){
            return res.status(400).json({ message:"title and date are required" });
        }
        // save who made it n create
        req.body.createdBy = req.user.userId;
        const event = await Event.create(req.body);
        res.status(201).json(event);
    }catch(error){
        res.status(500).json({
            message:"Failed to add event",
            error:error.message
        });
    }
})

// GET /events -> everyone sees all events, earliest date first
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch events",
    });
  }
});

// DELETE /events/:id -> admin or hod deletes an event
router.delete("/:id", allowRoles("admin","hod"), async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete event",
    });
  }
});

module.exports = router;
