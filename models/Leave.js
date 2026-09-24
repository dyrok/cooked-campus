const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
    applicant:{type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},  // student or faculty asking
    department:String,   // copied so hod sees only their dept leaves
    fromDate:{type:String, required:true},
    toDate:{type:String, required:true},
    reason:{type:String, required:true},
    // starts pending, hod/admin approves or rejects
    status:{type:String, enum:["pending","approved","rejected"], default:"pending"},
});

const Leave = mongoose.model("Leave",leaveSchema);
module.exports = Leave;
