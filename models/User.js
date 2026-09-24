const mongoose = require("mongoose");

// one collection for everyone, role field decides admin / hod / faculty / student
const userSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},   // unique = no 2 users w/ same email
    password:{type:String, required:true},
    role:{type:String, required:true, enum:["admin","hod","faculty","student"]},  // enum = only these 4 allowed
    department:String,   // like "CSE"
    semester:Number,     // students only
    section:String,      // students only
    rollNo:String,       // students only
    employeeId:String,   // faculty / hod only
});

// make model, mongo will save it in "users" collection
module.exports=mongoose.model("User",userSchema);
