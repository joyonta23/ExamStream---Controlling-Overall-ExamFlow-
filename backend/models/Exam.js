const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  examDuration: {
    type: Number, // in minutes
    required: true,
  },
  uploadDeadline: {
    type: Date,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed"],
    default: "upcoming",
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual to calculate exam end time
examSchema.virtual("endTime").get(function () {
  return new Date(this.startTime.getTime() + this.examDuration * 60000);
});

module.exports = mongoose.model("Exam", examSchema);
