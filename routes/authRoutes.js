// bring in express, jwt, n the User model
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { checkPassword } = require("../utils/password");
const router = express.Router();
// secret key used to sign the token (same one is in authMiddleware)
const JWT_SECRET = "campus_secret_key";

// POST /auth/login -> anyone can login (no token needed)
// no register route bcoz admin makes accounts (POST /users)
router.post("/login", async (req, res) => {
  try {
    // get email n password from body
    const { email, password } = req.body;
    // if any one is missing -> 400
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }
    // find user by email only (password in db is hashed, cant search by it)
    const user = await User.findOne({ email: email });
    // no user OR password doesnt match the saved hash -> wrong login, send 401
    // (same msg for both so nobody can guess which emails exist)
    if (!user || !checkPassword(password, user.password)) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    // make token w/ user info inside, expires in 1hr
    // role n dept are inside so middleware can chk them later
    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        role: user.role,
        department: user.department,
        semester: user.semester,
      },
      JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );
    // send token + basic user info back (no password!)
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    // something broke on server side
    res.status(500).json({
      message: error.message,
    });
  }
});
module.exports = router;
