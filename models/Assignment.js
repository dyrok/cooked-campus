const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
    course:{type:mongoose.Schema.Types.ObjectId, ref:"Course", required:true},
    title:{type:String, required:true},
    description:String,
    dueDate:String,
    createdBy:{type:mongoose.Schema.Types.ObjectId, ref:"User"},  // faculty who made it
    // submissions are kept inside the assignment itself as an array
    // each one = which student + their answer + when
    submissions:[
        {
            student:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
            answer:String,   // link or text
            submittedAt:{type:Date, default:Date.now},  // auto fills current time
        }
    ],
});

const Assignment = mongoose.model("Assignment",assignmentSchema);
module.exports = Assignment;
