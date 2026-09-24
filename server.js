// bring in express, cors n our db connect func
const express = require("express");
const cors = require("cors");
const {connectDB} = require("./config/db");
// import all route files (each one handles one module)
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const eventRoutes = require("./routes/eventRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const resultRoutes = require("./routes/resultRoutes");
// the jwt checker middleware
const authMiddleware = require("./middleware/authMiddleware");

// make the app, connect mongo
const app = express();
connectDB();
// cors so react (diff port) can call us, express.json so req.body works
app.use(cors());
app.use(express.json());

// login route is open, no token needed (bcoz u dont have one yet lol)
app.use("/auth",authRoutes);

// order matters!! everything BELOW this line goes thru authMiddleware first
// so no token -> 401, never reaches the routes
app.use(authMiddleware);
// all the protected routes
app.use("/users",userRoutes);
app.use("/courses",courseRoutes);
app.use("/attendance",attendanceRoutes);
app.use("/assignments",assignmentRoutes);
app.use("/notices",noticeRoutes);
app.use("/events",eventRoutes);
app.use("/complaints",complaintRoutes);
app.use("/leaves",leaveRoutes);
app.use("/results",resultRoutes);


// catch all, if nothing above matched just say api is running
app.use('/',(req,res)=>{
    res.send("Smart Campus API Running");
})

// start server on port 8000
app.listen(8000,()=>{
    console.log(`server is running on port 8000`);
})
