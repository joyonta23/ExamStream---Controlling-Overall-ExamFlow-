const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  answerFile: {
    type: String, // URL to uploaded file
    required: true,
  },
  answerFiles: {
    type: [String], // URLs to uploaded files
    default: [],
  },
  googleDriveFileId: {
    type: String, // Google Drive file ID
    default: null,
  },
  googleDriveFileIds: {
    type: [String], // Google Drive file IDs
    default: [],
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  isLate: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Answer", answerSchema);
