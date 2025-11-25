import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/Users.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  // 1. Check if user exists
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return res.status(400).json({
      success: false,
      message: "email already exist",
      field: "email",
    });
  }
  const salt = await bcrypt.genSalt(10);
  const HasedPass = await bcrypt.hash(password, salt);
  const CreateUser = new User({
    email,
    password: HasedPass,
  });

  try {
    const saveUser = await CreateUser.save();
    res.status(201).json({
      success: true,
      message: "user successfully registered",
      user: saveUser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: err.message,
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email not found",
        field: "email",
      });
    }

    // 2. Check password
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
        field: "password",
      });
    }

    // 3. Create and assign token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // optional: set expiry
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error logging in",
      error: err.message,
    });
  }
});

export default router;
