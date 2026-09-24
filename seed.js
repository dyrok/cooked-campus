// fills db w/ fake demo data. run: npm run seed
// careful!! it deletes everything in SmartCampusDB first
// import mongoose, db connect n all models
const mongoose = require("mongoose");
const {connectDB} = require("./config/db");
const User = require("./models/User");
const { hashPassword } = require("./utils/password");
const Course = require("./models/Course");
const Attendance = require("./models/Attendance");
const Assignment = require("./models/Assignment");
const Notice = require("./models/Notice");
const Event = require("./models/Event");
const Complaint = require("./models/Complaint");
const Leave = require("./models/Leave");
const Result = require("./models/Result");

const seed = async () => {
  // connect then wipe every collection so we start clean
  await connectDB();
  await User.deleteMany();
  await Course.deleteMany();
  await Attendance.deleteMany();
  await Assignment.deleteMany();
  await Notice.deleteMany();
  await Event.deleteMany();
  await Complaint.deleteMany();
  await Leave.deleteMany();
  await Result.deleteMany();

  // same password for everyone (hashPassword gives each user their own salt), make admin, hod n 2 faculty
  const pass = "password123";
  const admin = await User.create({ name: "Admin", email: "admin@campus.com", password: hashPassword(pass), role: "admin" });
  await User.create({ name: "Dr. Mehta (HOD CSE)", email: "hod@campus.com", password: hashPassword(pass), role: "hod", department: "CSE", employeeId: "HOD01" });
  const faculty = await User.create({ name: "Prof. Sharma", email: "faculty@campus.com", password: hashPassword(pass), role: "faculty", department: "CSE", employeeId: "FAC01" });
  await User.create({ name: "Prof. Iyer", email: "faculty2@campus.com", password: hashPassword(pass), role: "faculty", department: "ECE", employeeId: "FAC02" });

  // make 8 students in CSE sem 4, roll nos CSE101, CSE102...
  const names = ["Aarav", "Diya", "Kabir", "Meera", "Rohan", "Sara", "Vikram", "Zoya"];
  const students = [];
  for (let i = 0; i < names.length; i++) {
    const s = await User.create({
      name: names[i],
      email: names[i].toLowerCase() + "@campus.com",
      password: hashPassword(pass),
      role: "student",
      department: "CSE",
      semester: 4,
      section: "A",
      rollNo: "CSE" + (101 + i),
    });
    students.push(s);
  }

  // 2 courses, both taught by prof sharma
  const dbms = await Course.create({ code: "CS401", title: "Database Management Systems", department: "CSE", semester: 4, faculty: faculty._id });
  const os = await Course.create({ code: "CS402", title: "Operating Systems", department: "CSE", semester: 4, faculty: faculty._id });

  // 10 days of attendance for both courses
  // kabir absent every 2nd day (50%), rohan every 3rd day (70%) -> both at risk (<75%)
  for (let day = 1; day <= 10; day++) {
    // make date like "2026-09-01"
    const date = "2026-09-" + String(day).padStart(2, "0");
    for (const s of students) {
      // everyone present by default, then mark the skippers absent
      let status = "present";
      if (s.name === "Kabir" && day % 2 === 0) status = "absent";
      if (s.name === "Rohan" && day % 3 === 0) status = "absent";
      if (s.name === "Meera" && day === 7) status = "absent";
      // save 1 attendance doc per course
      for (const c of [dbms, os]) {
        await Attendance.create({ course: c._id, student: s._id, date: date, status: status });
      }
    }
  }

  // 1 sample of each module so no screen is empty
  await Assignment.create({ course: dbms._id, title: "ER Diagram for Library", description: "Draw ER diagram for a library system", dueDate: "2026-10-01", createdBy: faculty._id });
  await Notice.create({ title: "Mid-sem exams from 5 Oct", body: "Timetable will be shared soon.", department: "ALL", postedBy: admin._id });
  await Notice.create({ title: "CSE lab closed on Friday", body: "Maintenance work in Lab 2.", department: "CSE", postedBy: faculty._id });
  await Event.create({ title: "Tech Fest 2026", description: "Coding contest + hackathon", date: "2026-10-15", venue: "Main Auditorium", createdBy: admin._id });
  await Complaint.create({ student: students[0]._id, department: "CSE", subject: "WiFi", text: "WiFi not working in hostel block B" });
  await Leave.create({ applicant: students[1]._id, department: "CSE", fromDate: "2026-09-28", toDate: "2026-09-29", reason: "Family function" });
  await Result.create({ student: students[0]._id, course: dbms._id, marks: 82 });

  // print logins n close the db connection
  console.log("Demo data added. Password for everyone: password123");
  console.log("admin@campus.com, hod@campus.com, faculty@campus.com, aarav@campus.com");
  await mongoose.disconnect();
};

// run it
seed();
