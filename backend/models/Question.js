const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
  questionNumber: {
    type: Number,
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  questionImage: {
    type: String, // URL to uploaded image
    default: null,
  },
  questionPdf: {
    type: String, // URL to uploaded PDF
    default: null,
  },
  marks: {
    type: Number,
    default: 10,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Question", questionSchema);
