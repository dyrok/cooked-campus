const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
    student:{type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},
    course:{type:mongoose.Schema.Types.ObjectId, ref:"Course", required:true},
    marks:{type:Number, required:true, min:0, max:100},  // min/max = mongoose rejects marks outside 0-100
});

const Result = mongoose.model("Result",resultSchema);
module.exports = Result;
