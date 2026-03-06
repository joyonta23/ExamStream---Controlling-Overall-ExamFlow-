const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const {
  sendSignupConfirmation,
  sendApprovalEmail,
  sendRejectionEmail,
} = require("../services/emailService");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn(["instructor", "student"])
      .withMessage("Role must be either instructor or student"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    try {
      // Check if user exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
      });

      if (user) {
        // Send signup confirmation email
        await sendSignupConfirmation(user.email, user.name, user.role);

        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          message:
            "Account created successfully. Please check your email for confirmation.",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if user is approved
      if (!user.isApproved) {
        return res.status(403).json({
          message:
            "Your account is pending admin approval. Please check back later.",
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// @route   POST /api/auth/google
// @desc    Google OAuth login
// @access  Public
router.post("/google", async (req, res) => {
  const { token, role } = req.body;
  const requestedRole = ["instructor", "student"].includes(role)
    ? role
    : "student";

  if (!token) {
    return res.status(400).json({ message: "Google token is required" });
  }

  try {
    // Fetch user info from Google using the access token
    const userInfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`,
    );
    const googleUser = await userInfoResponse.json();

    if (!googleUser.email) {
      return res
        .status(400)
        .json({ message: "Failed to get user info from Google" });
    }

    const email = googleUser.email;
    const name = googleUser.name;

    console.log(
      `Google OAuth attempt - Email: ${email}, Requested role: ${requestedRole}`,
    );

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      console.log(
        `User found - Role: ${user.role}, Approved: ${user.isApproved}`,
      );

      // Allow admin to login regardless of requested role
      if (user.role !== "admin" && user.role !== requestedRole) {
        console.log(`Role mismatch: ${user.role} !== ${requestedRole}`);
        return res.status(403).json({
          message: `This Google account is registered as ${user.role}. Please continue as ${user.role}.`,
        });
      }

      // Check if user is approved
      if (!user.isApproved) {
        console.log(`User not approved: ${email}`);
        return res.status(403).json({
          message:
            "Your account is pending admin approval. Please check back later.",
        });
      }

      console.log(`Login successful for ${email} as ${user.role}`);

      // User exists and is approved, log them in
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      // Create new user
      // Use the requested role
      const userRole = requestedRole;

      user = await User.create({
        name,
        email,
        password: await bcrypt.hash(Math.random().toString(36), 10), // Random password for Google users
        role: userRole,
      });

      // Send signup confirmation email
      await sendSignupConfirmation(user.email, user.name, user.role);

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        message: "Account created successfully. Pending admin approval.",
      });
    }
  } catch (error) {
    console.error("Google auth error:", error);
    res
      .status(500)
      .json({ message: "Server error during Google authentication" });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
const { protect } = require("../middleware/auth");
router.get("/me", protect, async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

// @route   GET /api/auth/pending-users
// @desc    Get all pending approval users (admin only)
// @access  Private
router.get("/pending-users", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can access this" });
    }

    const pendingUsers = await User.find({ isApproved: false }).select(
      "-password",
    );
    res.json(pendingUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/auth/approve-user/:id
// @desc    Approve a pending user (admin only)
// @access  Private
router.put("/approve-user/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can approve users" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send approval email
    await sendApprovalEmail(user.email, user.name, user.role);

    res.json({
      message: "User approved successfully and notification sent",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/auth/reject-user/:id
// @desc    Reject/delete a pending user (admin only)
// @access  Private
router.delete("/reject-user/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can reject users" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send rejection email before deleting
    await sendRejectionEmail(user.email, user.name);

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User rejected, deleted, and notification sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/auth/all-users
// @desc    Get all users (admin only) - optional for admin dashboard
// @access  Private
router.get("/all-users", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can access this" });
    }

    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
