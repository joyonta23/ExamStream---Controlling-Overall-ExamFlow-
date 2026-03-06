const express = require("express");
const router = express.Router();
const { protect, instructorOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");
const Grading = require("../models/Grading");
const Answer = require("../models/Answer");
const Exam = require("../models/Exam");
const cloudinary = require("../config/cloudinary");

// Use raw delivery for document types so direct links open reliably.
const getResourceTypeForMime = (mimeType = "") => {
  if (mimeType.startsWith("image/")) {
    return "image";
  }
  return "raw";
};

// Helper function to upload graded file to Cloudinary
const uploadGradedFileToCloudinary = (fileBuffer, fileName, mimeType) => {
  const resourceType = getResourceTypeForMime(mimeType);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "examstream/graded",
        resource_type: resourceType,
        public_id: fileName,
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

// @route   POST /api/grading/submit
// @desc    Submit graded answer with score and feedback
// @access  Private (Instructor only)
router.post(
  "/submit",
  protect,
  instructorOnly,
  upload.fields([
    { name: "gradedFiles", maxCount: 10 },
    { name: "gradedFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { answerId, score, feedback } = req.body;
      const uploadedFiles = [
        ...(req.files?.gradedFiles || []),
        ...(req.files?.gradedFile || []),
      ];

      if (uploadedFiles.length === 0) {
        return res
          .status(400)
          .json({ message: "Please upload at least one graded answer file" });
      }

      // Check if answer exists
      const answer = await Answer.findById(answerId).populate(
        "student exam question",
      );
      if (!answer) {
        return res.status(404).json({ message: "Answer not found" });
      }

      // Check if exam belongs to this instructor
      const exam = await Exam.findById(answer.exam._id);
      if (exam.instructor.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to grade this submission" });
      }

      const timestamp = Date.now();

      // Upload all selected graded files to Cloudinary
      const gradedFileUrls = await Promise.all(
        uploadedFiles.map((file, index) => {
          const fileName = `${answer.student._id}_${answer.question._id}_graded_${timestamp}_${index + 1}`;
          return uploadGradedFileToCloudinary(
            file.buffer,
            fileName,
            file.mimetype,
          );
        }),
      );

      const primaryGradedFile = gradedFileUrls[0];

      console.log(
        `Graded files uploaded to Cloudinary: ${gradedFileUrls.length}`,
      );

      // Check if grading already exists
      let grading = await Grading.findOne({ answer: answerId });

      if (grading) {
        // Update existing grading
        grading.gradedFile = primaryGradedFile;
        grading.gradedFiles = gradedFileUrls;
        grading.score = score;
        grading.feedback = feedback;
        grading.markedAt = new Date();
        await grading.save();
      } else {
        // Create new grading
        grading = await Grading.create({
          answer: answerId,
          instructor: req.user._id,
          gradedFile: primaryGradedFile,
          gradedFiles: gradedFileUrls,
          score,
          feedback,
        });
      }

      res.status(201).json(grading);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);

// @route   GET /api/grading/answer/:answerId
// @desc    Get grading for an answer
// @access  Private
router.get("/answer/:answerId", protect, async (req, res) => {
  try {
    const grading = await Grading.findOne({
      answer: req.params.answerId,
    }).populate("instructor", "name email");

    if (!grading) {
      return res.status(404).json({ message: "No grading found" });
    }

    res.json(grading);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/grading/exam/:examId
// @desc    Get all gradings for an exam (for instructor)
// @access  Private (Instructor only)
router.get("/exam/:examId", protect, instructorOnly, async (req, res) => {
  try {
    // Verify instructor owns the exam
    const exam = await Exam.findById(req.params.examId);
    if (!exam || exam.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Get all answers for the exam
    const answers = await Answer.find({ exam: req.params.examId });
    const answerIds = answers.map((a) => a._id);

    // Get all gradings for these answers
    const gradings = await Grading.find({ answer: { $in: answerIds } })
      .populate("answer")
      .populate("instructor", "name email");

    res.json(gradings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/grading/student/:studentId/exam/:examId
// @desc    Get all grades for a student in an exam
// @access  Private
router.get("/student/:studentId/exam/:examId", protect, async (req, res) => {
  try {
    // If student, they can only view their own grades
    if (
      req.user.role === "student" &&
      req.user._id.toString() !== req.params.studentId
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Get all answers for student in exam
    const answers = await Answer.find({
      student: req.params.studentId,
      exam: req.params.examId,
    }).populate("question", "questionNumber questionText marks");

    const answerIds = answers.map((a) => a._id);

    // Get gradings for these answers
    const gradings = await Grading.find({
      answer: { $in: answerIds },
    })
      .populate("instructor", "name email")
      .populate("answer");

    res.json(gradings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/grading/:id
// @desc    Delete grading
// @access  Private (Instructor only)
router.delete("/:id", protect, instructorOnly, async (req, res) => {
  try {
    const grading = await Grading.findById(req.params.id);

    if (!grading) {
      return res.status(404).json({ message: "Grading not found" });
    }

    // Check if user is the grading instructor
    if (grading.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await grading.deleteOne();

    res.json({ message: "Grading deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
