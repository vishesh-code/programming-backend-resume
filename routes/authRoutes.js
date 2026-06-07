// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "../models/UsersModel.js";

// const router = express.Router();

// router.post("/register", async (req, res) => {
//   const { email, password } = req.body;
//   // 1. Check if user exists
//   const emailExists = await User.findOne({ email });
//   if (emailExists) {
//     return res.status(400).json({
//       success: false,
//       message: "email already exist",
//       field: "email",
//     });
//   }
//   const salt = await bcrypt.genSalt(10);
//   const HasedPass = await bcrypt.hash(password, salt);
//   const CreateUser = new User({
//     email,
//     password: HasedPass,
//   });

//   try {
//     const saveUser = await CreateUser.save();
//     res.status(201).json({
//       success: true,
//       message: "user successfully registered",
//       user: saveUser,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Error registering user",
//       error: err.message,
//     });
//   }
// });

// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // 1. Check email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "Email not found",
//         field: "email",
//       });
//     }

//     // 2. Check password
//     const validPass = await bcrypt.compare(password, user.password);
//     if (!validPass) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid password",
//         field: "password",
//       });
//     }

//     // 3. Create and assign token
//     const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1h", // optional: set expiry
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         email: user.email,
//       },
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: "Error logging in",
//       error: err.message,
//     });
//   }
// });

// export default router;




import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import User from "../models/UsersModel.js";

const router = express.Router();

// Initialize Google Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// -----------------------------------------
// 1. STANDARD REGISTER (Your existing code)
// -----------------------------------------
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const emailExists = await User.findOne({ email });
  
  if (emailExists) {
    return res.status(400).json({ success: false, message: "email already exist", field: "email" });
  }
  
  const salt = await bcrypt.genSalt(10);
  const HasedPass = await bcrypt.hash(password, salt);
  const CreateUser = new User({ email, password: HasedPass });

  try {
    const saveUser = await CreateUser.save();
    res.status(201).json({ success: true, message: "user successfully registered", user: saveUser });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error registering user", error: err.message });
  }
});

// -----------------------------------------
// 2. STANDARD LOGIN (Your existing code)
// -----------------------------------------
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ success: false, message: "Email not found", field: "email" });
//     }
    
//     // Check if user is a Google-only user who hasn't set a password
//     if (!user.password) {
//       return res.status(400).json({ success: false, message: "Please login with Google" });
//     }

//     const validPass = await bcrypt.compare(password, user.password);
//     if (!validPass) {
//       return res.status(400).json({ success: false, message: "Invalid password", field: "password" });
//     }

//     const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
//     return res.status(200).json({ success: true, message: "Login successful", token, user: { id: user._id, email: user.email } });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: "Error logging in", error: err.message });
//   }
// });



router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Email not found", field: "email" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: "Your account has been deactivated by the admin." });
    }
    
    // Check if user is a Google-only user who hasn't set a password
    if (!user.password) {
      return res.status(400).json({ success: false, message: "Please login with Google" });
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).json({ success: false, message: "Invalid password", field: "password" });
    }

    // 🔥 NEW: Check if this user is the ONE admin from your .env file
    const isSuperAdmin = user.email === process.env.ADMIN_EMAIL;
    const userRole = isSuperAdmin ? 'admin' : 'user';

    // 🔥 NEW: Add the userRole to the JWT Token payload
    const token = jwt.sign(
      { _id: user._id, role: userRole }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );
    
    // 🔥 NEW: Send the role back to the React frontend
    return res.status(200).json({ 
      success: true, 
      message: "Login successful", 
      token, 
      user: { 
        id: user._id, 
        email: user.email,
        role: userRole // React will use this to navigate to /dashboard or /admin
      } 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error logging in", error: err.message });
  }
});
// -----------------------------------------
// 3. GOOGLE LOGIN ROUTE
// -----------------------------------------
// router.post("/google-login", async (req, res) => {
//   const { token } = req.body; 

//   try {
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });
    
//     const { email, sub: googleId } = ticket.getPayload();
//     let user = await User.findOne({ email });

//     if (!user) {
//       // Create new user if they don't exist
//       user = new User({ email, googleId });
//       await user.save();
//     } else if (!user.googleId) {
//       // Link Google ID if user exists from standard register
//       user.googleId = googleId;
//       await user.save();
//     }

//     // Generate JWT for the frontend to use
//     const jwtToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

//     return res.status(200).json({ success: true, message: "Google login successful", token: jwtToken, user: { id: user._id, email: user.email } });
//   } catch (err) {
//     return res.status(400).json({ success: false, message: "Invalid Google Token", error: err.message });
//   }
// });


// router.post("/google-login", async (req, res) => {
//   const { token } = req.body; 

//   try {
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });
    
//     const { email, sub: googleId } = ticket.getPayload();
//     let user = await User.findOne({ email });

//     if (!user) {
//       // Create new user if they don't exist
//       user = new User({ email, googleId });
//       await user.save();
//     } else if (!user.googleId) {
//       // Link Google ID if user exists from standard register
//       user.googleId = googleId;
//       await user.save();
//     }

//     // 🔥 NEW: Check if this Google user is the ONE admin from your .env file
//     const isSuperAdmin = user.email === process.env.ADMIN_EMAIL;
//     const userRole = isSuperAdmin ? 'admin' : 'user';

//     // 🔥 NEW: Generate JWT with the role included
//     const jwtToken = jwt.sign(
//       { _id: user._id, role: userRole }, 
//       process.env.JWT_SECRET, 
//       { expiresIn: "1h" }
//     );

//     // 🔥 NEW: Send the role back to the frontend in the user object
//     return res.status(200).json({ 
//       success: true, 
//       message: "Google login successful", 
//       token: jwtToken, 
//       user: { 
//         id: user._id, 
//         email: user.email,
//         role: userRole // React will use this to navigate to /dashboard or /admin
//       } 
//     });
//   } catch (err) {
//     return res.status(400).json({ success: false, message: "Invalid Google Token", error: err.message });
//   }
// });



router.post("/google-login", async (req, res) => {
  const { token } = req.body; 

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { email, sub: googleId } = ticket.getPayload();
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if they don't exist
      user = new User({ email, googleId });
      await user.save();
    } else if (!user.googleId) {
      // Link Google ID if user exists from standard register
      user.googleId = googleId;
      await user.save();
    }

    // 🔥 NEW: Check if the user is deactivated before proceeding
    if (user.isActive === false) {
      return res.status(403).json({ 
        success: false, 
        message: "Your account has been deactivated by the admin." 
      });
    }

    // Check if this Google user is the ONE admin from your .env file
    const isSuperAdmin = user.email === process.env.ADMIN_EMAIL;
    const userRole = isSuperAdmin ? 'admin' : 'user';

    // Generate JWT with the role included
    const jwtToken = jwt.sign(
      { _id: user._id, role: userRole }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    // Send the role back to the frontend in the user object
    return res.status(200).json({ 
      success: true, 
      message: "Google login successful", 
      token: jwtToken, 
      user: { 
        id: user._id, 
        email: user.email,
        role: userRole // React will use this to navigate to /dashboard or /admin
      } 
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: "Invalid Google Token", error: err.message });
  }
});



// -----------------------------------------
// 4. FORGOT PASSWORD (Send Email)
// -----------------------------------------
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // Token expires in 15 mins
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      text: `Click the link to reset your password: \n\n ${resetUrl} \n\n If you did not request this, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent successfully" });

  } catch (err) {
    res.status(500).json({ success: false, message: "Error sending email", error: err.message });
  }
});

// -----------------------------------------
// 5. RESET PASSWORD (Save New Password)
// -----------------------------------------
router.put("/reset-password/:token", async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ success: false, message: "Token is invalid or has expired" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error resetting password", error: err.message });
  }
});

export default router;