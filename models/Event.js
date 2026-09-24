const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    title:{type:String, required:true},
    description:String,
    date:{type:String, required:true},   // text date like "2026-10-15"
    venue:String,
    createdBy:{type:mongoose.Schema.Types.ObjectId, ref:"User"},  // who added it
});

const Event = mongoose.model("Event",eventSchema);
module.exports = Event;
