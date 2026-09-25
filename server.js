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
// swagger ui (api docs + testing page) n our openapi spec file
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

// make the app, connect mongo
const app = express();
connectDB();
// cors so react (diff port) can call us, express.json so req.body works
app.use(cors());
app.use(express.json());

// swagger docs + testing page -> open http://localhost:8000/api-docs
// (has to be above authMiddleware or u'd need a token just to open the docs)
// persistAuthorization = remembers ur token even after refreshing the page
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    swaggerOptions: { persistAuthorization: true },
}));
// raw openapi spec as json (can import it into postman)
app.get("/api-docs.json", (req,res)=>{
    res.json(swaggerDocument);
})
// home page just sends u to the swagger docs
app.get("/", (req,res)=>{
    res.redirect("/api-docs");
})

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


// catch all, if nothing above matched -> 404 route not found
app.use('/',(req,res)=>{
    res.status(404).json({
        message:"Route not found: " + req.method + " " + req.originalUrl
    });
})

// start server on port 8000
app.listen(8000,()=>{
    console.log(`server is running on port 8000`);
})
