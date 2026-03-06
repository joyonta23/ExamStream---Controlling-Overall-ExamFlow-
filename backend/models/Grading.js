const mongoose = require("mongoose");

const gradingSchema = new mongoose.Schema({
  answer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Answer",
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  gradedFile: {
    type: String, // URL to graded/marked file
    required: true,
  },
  gradedFiles: {
    type: [String], // URLs to graded/marked files
    default: [],
  },
  score: {
    type: Number,
    min: 0,
    required: true,
  },
  feedback: {
    type: String,
    trim: true,
  },
  markedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Grading", gradingSchema);
