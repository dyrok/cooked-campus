// express, Notice model n role chk
const express = require("express");
const Notice = require("../models/Notice");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// POST /notices -> admin, hod, faculty post a notice
router.post('/', allowRoles("admin","hod","faculty"), async(req,res)=>{
    try{
        // title n body r must
        const { title, body } = req.body;
        if(!title || !body){
            return res.status(400).json({ message:"title and body are required" });
        }
        // save who posted it n create
        req.body.postedBy = req.user.userId;
        const notice = await Notice.create(req.body);
        res.status(201).json(notice);
    }catch(error){
        res.status(500).json({
            message:"Failed to add notice",
            error:error.message
        });
    }
})

// GET /notices -> everyone, w/ search + pages
// eg: /notices?search=exam&page=1&limit=5
router.get("/", async (req, res) => {
  try {
    const filter = {};
    // admin sees all, others only see college wide ("ALL") + own dept ones
    if (req.user.role !== "admin") {
      filter.department = { $in: ["ALL", req.user.department] };
    }
    // search in title ("i" = ignore caps)
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: "i" };
    }
    // page no n items per page
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    // count all, then newest first, skip old pages, take only 'limit'
    const total = await Notice.countDocuments(filter);
    const notices = await Notice.find(filter)
      .populate("postedBy", "name role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // send list + page info
    res.json({ data: notices, total: total, page: page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch notices",
    });
  }
});

// DELETE /notices/:id -> admin or hod deletes a notice
router.delete("/:id", allowRoles("admin","hod"), async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: "Notice deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete notice",
    });
  }
});

module.exports = router;
