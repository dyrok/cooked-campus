const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    code:{type:String, required:true, unique:true},   // like "CS401", cant repeat
    title:{type:String, required:true},
    department:{type:String, required:true},
    semester:{type:Number, required:true},
    // ref:"User" means this stores the faculty's _id, populate() can fill name later
    faculty:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
});

const Course = mongoose.model("Course",courseSchema);
module.exports = Course;
