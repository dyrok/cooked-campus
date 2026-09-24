const mongoose = require("mongoose");
// connect to mongo (local, db name SmartCampusDB), if it fails just log the error
const connectDB = async()=>{
    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/SmartCampusDB");
        console.log("MongoDB Connected");
    }catch(error){
        console.log("Database connection failed "+error.message);
    }
};
// export as object so we do const {connectDB} = require(...)
module.exports={connectDB};
