const express = require("express");
const router = express.Router();
const { protect, studentOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");
const Answer = require("../models/Answer");
const Exam = require("../models/Exam");
const Question = require("../models/Question");
const cloudinary = require("../config/cloudinary");
const { uploadToGoogleDrive } = require("../config/googleDrive");

// Use raw delivery for document types so direct links open reliably.
const getResourceTypeForMime = (mimeType = "") => {
  if (mimeType.startsWith("image/")) {
    return "image";
  }
  return "raw";
};

// Helper function to upload file to Cloudinary
const uploadFileToCloudinary = (fileBuffer, fileName, mimeType) => {
  const resourceType = getResourceTypeForMime(mimeType);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "examstream/answers",
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

// @route   POST /api/answers
// @desc    Submit answer with file upload
// @access  Private (Student only)
router.post(
  "/",
  protect,
  studentOnly,
  upload.fields([
    { name: "answerFiles", maxCount: 10 },
    { name: "answerFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { examId, questionId } = req.body;
      const uploadedFiles = [
        ...(req.files?.answerFiles || []),
        ...(req.files?.answerFile || []),
      ];

      if (uploadedFiles.length === 0) {
        return res
          .status(400)
          .json({ message: "Please upload at least one answer file" });
      }

      // Check if exam exists
      const exam = await Exam.findById(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }

      // Check if question exists
      const question = await Question.findById(questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      // Check if upload is allowed (before upload deadline)
      const now = new Date();
      const uploadDeadline = new Date(exam.uploadDeadline);

      if (now > uploadDeadline) {
        return res.status(403).json({ message: "Upload deadline has passed" });
      }

      const isLate =
        now > new Date(exam.startTime.getTime() + exam.examDuration * 60000);

      // Check if answer already exists
      const existingAnswer = await Answer.findOne({
        student: req.user._id,
        exam: examId,
        question: questionId,
      });

      const timestamp = Date.now();

      // Upload all selected files to Cloudinary
      const answerFileUrls = await Promise.all(
        uploadedFiles.map((file, index) => {
          const fileName = `${req.user._id}_${examId}_${questionId}_${timestamp}_${index + 1}`;
          return uploadFileToCloudinary(file.buffer, fileName, file.mimetype);
        }),
      );

      console.log(
        `Answer files uploaded to Cloudinary: ${answerFileUrls.length}`,
      );

      let googleDriveFileIds = [];

      // Try uploading to Google Drive if configured
      if (
        process.env.GOOGLE_REFRESH_TOKEN &&
        process.env.GOOGLE_DRIVE_FOLDER_ID
      ) {
        try {
          const uploadedDriveFiles = await Promise.all(
            uploadedFiles.map((file) =>
              uploadToGoogleDrive(
                file.buffer,
                `${req.user.name}_Q${question.questionNumber}_${file.originalname}`,
                file.mimetype,
              ),
            ),
          );
          googleDriveFileIds = uploadedDriveFiles.map((file) => file.id);
        } catch (driveError) {
          console.error("Google Drive upload failed:", driveError);
          // Continue even if Google Drive upload fails
        }
      }

      const primaryAnswerFile = answerFileUrls[0];
      const primaryGoogleDriveId = googleDriveFileIds[0] || null;

      if (existingAnswer) {
        // Update existing answer
        existingAnswer.answerFile = primaryAnswerFile;
        existingAnswer.answerFiles = answerFileUrls;
        existingAnswer.googleDriveFileId = primaryGoogleDriveId;
        existingAnswer.googleDriveFileIds = googleDriveFileIds;
        existingAnswer.submittedAt = new Date();
        existingAnswer.isLate = isLate;
        await existingAnswer.save();
        return res.json(existingAnswer);
      }

      // Create new answer
      const answer = await Answer.create({
        student: req.user._id,
        exam: examId,
        question: questionId,
        answerFile: primaryAnswerFile,
        answerFiles: answerFileUrls,
        googleDriveFileId: primaryGoogleDriveId,
        googleDriveFileIds: googleDriveFileIds,
        isLate: isLate,
      });

      res.status(201).json(answer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);

// @route   GET /api/answers/exam/:examId
// @desc    Get all answers for an exam (for instructors or student's own answers)
// @access  Private
router.get("/exam/:examId", protect, async (req, res) => {
  try {
    let query = { exam: req.params.examId };

    // If student, only show their own answers
    if (req.user.role === "student") {
      query.student = req.user._id;
    }

    const answers = await Answer.find(query)
      .populate("student", "name email")
      .populate("question", "questionNumber questionText")
      .sort({ submittedAt: -1 });

    res.json(answers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/answers/student/:studentId/exam/:examId
// @desc    Get answers by specific student for an exam
// @access  Private
router.get("/student/:studentId/exam/:examId", protect, async (req, res) => {
  try {
    const answers = await Answer.find({
      student: req.params.studentId,
      exam: req.params.examId,
    })
      .populate("question", "questionNumber questionText marks")
      .sort({ "question.questionNumber": 1 });

    res.json(answers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/answers/my-answers/:examId
// @desc    Get current student's answers for an exam
// @access  Private (Student)
router.get("/my-answers/:examId", protect, studentOnly, async (req, res) => {
  try {
    const answers = await Answer.find({
      student: req.user._id,
      exam: req.params.examId,
    })
      .populate("question", "questionNumber questionText")
      .sort({ "question.questionNumber": 1 });

    res.json(answers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/answers/:id
// @desc    Delete answer
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // Students can only delete their own answers
    if (
      req.user.role === "student" &&
      answer.student.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this answer" });
    }

    await answer.deleteOne();

    res.json({ message: "Answer deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
