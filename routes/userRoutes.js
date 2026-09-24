// express, User model n the role chk middleware
const express = require("express");
const User = require("../models/User");
const { hashPassword } = require("../utils/password");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// POST /users -> admin adds a new student / faculty / hod
router.post('/', allowRoles("admin"), async(req,res)=>{
    try{
        // these 4 fields r must, if any missing -> 400
        const { name, email, password, role } = req.body;
        if(!name || !email || !password || !role){
            return res.status(400).json({
                message:"name, email, password and role are required"
            });
        }
        // chk if email already used by someone
        const exists = await User.findOne({ email: email });
        if(exists){
            return res.status(400).json({ message:"Email already exists" });
        }
        // never save the real password -> swap it w/ the salted hash
        req.body.password = hashPassword(password);
        // save user in db n send back basic info (not the password)
        const user = await User.create(req.body);
        res.status(201).json({
            message:"User added",
            user:{ _id:user._id, name:user.name, email:user.email, role:user.role }
        });
    }catch(error){
        res.status(500).json({
            message:"Failed to add user",
            error:error.message
        });
    }
})

// GET /users -> admin, hod, faculty see list of users w/ search + pages
// eg: /users?role=student&search=rahul&department=CSE&page=1&limit=5
router.get("/", allowRoles("admin","hod","faculty"), async (req, res) => {
  try {
    // build the filter step by step, default role = student
    const filter = {};
    filter.role = req.query.role || "student";

    // faculty can only see students, nothing else
    if (req.user.role === "faculty") {
      filter.role = "student";
    }

    // hod can only see their own dept, so force it
    // others can pick a dept from the url if they want
    if (req.user.role === "hod") {
      filter.department = req.user.department;
    } else if (req.query.department) {
      filter.department = req.query.department;
    }

    // search -> match name OR email OR roll no ("i" = ignore caps)
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
        { rollNo: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // page no n how many per page (defaults 1 n 5)
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    // count all matches, then skip old pages n grab only 'limit' items
    // select("-password") = dont send password
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit);

    // send the list + page info so frontend can show prev/next
    res.json({
      data: users,
      total: total,
      page: page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
});

// DELETE /users/:id -> admin removes a user
router.delete("/:id", allowRoles("admin"), async (req, res) => {
  try {
    // delete by id, if nothing got deleted -> 404
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete user",
    });
  }
});

module.exports = router;
