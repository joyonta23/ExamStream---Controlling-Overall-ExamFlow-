const express = require("express");
const router = express.Router();
const { protect, instructorOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");
const Question = require("../models/Question");
const Exam = require("../models/Exam");
const cloudinary = require("../config/cloudinary");

// Helper function to upload file to Cloudinary
const uploadFileToCloudinary = (fileBuffer, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "examstream/questions",
        resource_type: resourceType,
        type: "upload", // Ensures public access
        access_mode: "public",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      },
    );
    uploadStream.end(fileBuffer);
  });
};

// @route   POST /api/questions
// @desc    Create question with optional image and/or PDF
// @access  Private (Instructor only)
router.post(
  "/",
  protect,
  instructorOnly,
  upload.fields([
    { name: "questionImage", maxCount: 1 },
    { name: "questionPdf", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { examId, questionNumber, questionText, marks } = req.body;

      // Check if exam exists
      const exam = await Exam.findById(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }

      // Check if user is the exam creator
      if (exam.instructor.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to add questions to this exam" });
      }

      // Respect configured question limit on the exam.
      if (
        Number.isInteger(exam.totalQuestions) &&
        exam.questions.length >= exam.totalQuestions
      ) {
        return res.status(400).json({
          message: `Question limit reached (${exam.totalQuestions}). Increase total question count to add more.`,
        });
      }

      const parsedQuestionNumber = Number(questionNumber);
      if (!Number.isInteger(parsedQuestionNumber) || parsedQuestionNumber < 1) {
        return res
          .status(400)
          .json({ message: "Question number must be an integer >= 1" });
      }

      if (
        Number.isInteger(exam.totalQuestions) &&
        parsedQuestionNumber > exam.totalQuestions
      ) {
        return res.status(400).json({
          message: `Question number cannot exceed configured total questions (${exam.totalQuestions})`,
        });
      }

      let questionImageUrl = null;
      let questionPdfUrl = null;

      // Upload image if provided
      if (req.files && req.files.questionImage) {
        questionImageUrl = await uploadFileToCloudinary(
          req.files.questionImage[0].buffer,
          "image",
        );
      }

      // Upload PDF if provided
      if (req.files && req.files.questionPdf) {
        questionPdfUrl = await uploadFileToCloudinary(
          req.files.questionPdf[0].buffer,
          "raw",
        );
      }

      // Create question
      const question = await Question.create({
        exam: examId,
        questionNumber: parsedQuestionNumber,
        questionText,
        questionImage: questionImageUrl,
        questionPdf: questionPdfUrl,
        marks,
      });

      // Add question to exam
      exam.questions.push(question._id);
      await exam.save();

      res.status(201).json(question);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);

// @route   GET /api/questions/exam/:examId
// @desc    Get all questions for an exam
// @access  Private
router.get("/exam/:examId", protect, async (req, res) => {
  try {
    const questions = await Question.find({ exam: req.params.examId }).sort({
      questionNumber: 1,
    });

    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/questions/:id
// @desc    Get single question
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/questions/:id
// @desc    Update question
// @access  Private (Instructor only)
router.put(
  "/:id",
  protect,
  instructorOnly,
  upload.single("questionImage"),
  async (req, res) => {
    try {
      const question = await Question.findById(req.params.id).populate("exam");

      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      // Check if user is the exam creator
      if (question.exam.instructor.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this question" });
      }

      const { questionNumber, questionText, marks } = req.body;

      question.questionNumber = questionNumber || question.questionNumber;
      question.questionText = questionText || question.questionText;
      question.marks = marks || question.marks;

      // Upload new image if provided
      if (req.file) {
        question.questionImage = await uploadImageToCloudinary(req.file.buffer);
      }

      await question.save();

      res.json(question);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// @route   DELETE /api/questions/:id
// @desc    Delete question
// @access  Private (Instructor only)
router.delete("/:id", protect, instructorOnly, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate("exam");

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check if user is the exam creator
    if (question.exam.instructor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this question" });
    }

    // Remove question from exam
    await Exam.findByIdAndUpdate(question.exam._id, {
      $pull: { questions: question._id },
    });

    await question.deleteOne();

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
