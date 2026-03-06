const express = require("express");
const router = express.Router();
const { protect, instructorOnly } = require("../middleware/auth");
const Exam = require("../models/Exam");
const Question = require("../models/Question");

// @route   POST /api/exams
// @desc    Create new exam
// @access  Private (Instructor only)
router.post("/", protect, instructorOnly, async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      examDuration,
      uploadDeadline,
      totalQuestions,
    } = req.body;

    const parsedStartTime = new Date(startTime);
    const parsedUploadDeadline = new Date(uploadDeadline);
    const parsedExamDuration = Number(examDuration);
    const parsedTotalQuestions = Number(totalQuestions || 1);

    if (
      Number.isNaN(parsedStartTime.getTime()) ||
      Number.isNaN(parsedUploadDeadline.getTime())
    ) {
      return res.status(400).json({ message: "Invalid date/time provided" });
    }

    if (!Number.isFinite(parsedExamDuration) || parsedExamDuration < 1) {
      return res
        .status(400)
        .json({ message: "Exam duration must be at least 1 minute" });
    }

    if (!Number.isInteger(parsedTotalQuestions) || parsedTotalQuestions < 1) {
      return res.status(400).json({
        message: "Total question count must be an integer greater than 0",
      });
    }

    if (parsedUploadDeadline <= parsedStartTime) {
      return res
        .status(400)
        .json({ message: "Upload deadline must be after start time" });
    }

    const exam = await Exam.create({
      title,
      description,
      instructor: req.user._id,
      startTime: parsedStartTime,
      examDuration: parsedExamDuration,
      uploadDeadline: parsedUploadDeadline,
      totalQuestions: parsedTotalQuestions,
    });

    res.status(201).json(exam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/exams
// @desc    Get all exams
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    let query = {};

    // If instructor, show only their exams
    if (req.user.role === "instructor") {
      query.instructor = req.user._id;
    }

    const exams = await Exam.find(query)
      .populate("instructor", "name email")
      .populate("questions")
      .sort({ startTime: -1 });

    res.json(exams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/exams/:id
// @desc    Get single exam
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate("instructor", "name email")
      .populate("questions");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.json(exam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/exams/:id
// @desc    Update exam
// @access  Private (Instructor only)
router.put("/:id", protect, instructorOnly, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate("questions");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Check if user is the exam creator
    if (exam.instructor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this exam" });
    }

    const {
      title,
      description,
      startTime,
      examDuration,
      uploadDeadline,
      totalQuestions,
      status,
    } = req.body;

    const updatedStartTime =
      startTime !== undefined ? new Date(startTime) : exam.startTime;
    const updatedUploadDeadline =
      uploadDeadline !== undefined
        ? new Date(uploadDeadline)
        : exam.uploadDeadline;
    const updatedExamDuration =
      examDuration !== undefined ? Number(examDuration) : exam.examDuration;

    let updatedTotalQuestions = exam.totalQuestions || exam.questions.length;
    if (totalQuestions !== undefined) {
      updatedTotalQuestions = Number(totalQuestions);
      if (
        !Number.isInteger(updatedTotalQuestions) ||
        updatedTotalQuestions < 1
      ) {
        return res.status(400).json({
          message: "Total question count must be an integer greater than 0",
        });
      }

      if (updatedTotalQuestions < exam.questions.length) {
        return res.status(400).json({
          message: `Total question count cannot be less than existing questions (${exam.questions.length})`,
        });
      }
    }

    if (
      Number.isNaN(updatedStartTime.getTime()) ||
      Number.isNaN(updatedUploadDeadline.getTime())
    ) {
      return res.status(400).json({ message: "Invalid date/time provided" });
    }

    if (!Number.isFinite(updatedExamDuration) || updatedExamDuration < 1) {
      return res
        .status(400)
        .json({ message: "Exam duration must be at least 1 minute" });
    }

    if (updatedUploadDeadline <= updatedStartTime) {
      return res
        .status(400)
        .json({ message: "Upload deadline must be after start time" });
    }

    if (title !== undefined) exam.title = title;
    if (description !== undefined) exam.description = description;
    exam.startTime = updatedStartTime;
    exam.examDuration = updatedExamDuration;
    exam.uploadDeadline = updatedUploadDeadline;
    exam.totalQuestions = updatedTotalQuestions;
    if (status !== undefined) exam.status = status;

    await exam.save();

    const updatedExam = await Exam.findById(exam._id)
      .populate("instructor", "name email")
      .populate("questions");

    res.json(updatedExam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/exams/:id
// @desc    Delete exam
// @access  Private (Instructor only)
router.delete("/:id", protect, instructorOnly, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Check if user is the exam creator
    if (exam.instructor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this exam" });
    }

    // Delete all questions associated with this exam
    await Question.deleteMany({ exam: exam._id });

    await exam.deleteOne();

    res.json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/exams/:id/status
// @desc    Get exam status and time information
// @access  Private
router.get("/:id/status", protect, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(startTime.getTime() + exam.examDuration * 60000);
    const uploadDeadline = new Date(exam.uploadDeadline);

    let status = "upcoming";
    let canUpload = false;

    if (now < startTime) {
      status = "upcoming";
    } else if (now >= startTime && now < endTime) {
      status = "ongoing";
      canUpload = true;
    } else if (now >= endTime && now < uploadDeadline) {
      status = "upload_period";
      canUpload = true;
    } else {
      status = "completed";
      canUpload = false;
    }

    res.json({
      status,
      canUpload,
      startTime,
      endTime,
      uploadDeadline,
      currentTime: now,
      timeUntilStart: startTime - now,
      timeUntilEnd: endTime - now,
      timeUntilUploadDeadline: uploadDeadline - now,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
