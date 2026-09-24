const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
    student:{type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},  // who complained
    department:String,   // copied from student so hod can filter by dept
    subject:{type:String, required:true},
    text:{type:String, required:true},
    // new complaint starts as "open", hod/admin moves it forward
    status:{type:String, enum:["open","in-progress","resolved"], default:"open"},
    createdAt:{type:Date, default:Date.now},
});

const Complaint = mongoose.model("Complaint",complaintSchema);
module.exports = Complaint;
