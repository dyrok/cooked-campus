const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
    title:{type:String, required:true},
    body:{type:String, required:true},
    department:{type:String, default:"ALL"},  // "ALL" = whole college, or a dept like "CSE"
    postedBy:{type:mongoose.Schema.Types.ObjectId, ref:"User"},  // who posted
    createdAt:{type:Date, default:Date.now},  // auto time, used to sort newest first
});

const Notice = mongoose.model("Notice",noticeSchema);
module.exports = Notice;
