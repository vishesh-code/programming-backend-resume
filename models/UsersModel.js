// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     email: {
//       required: true,
//       type: String,
//       unique: true,
//       trim: true,
//     },

//     password: {
//       type: String,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// const User = mongoose.model("User", userSchema);
// export default User;




import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      required: true,
      type: String,
      unique: true,
      trim: true,
    },
    // Password is no longer required because Google users don't have one initially
    password: {
      type: String,
      required: false, 
    },
    // New field to link Google accounts
    googleId: {
      type: String,
      required: false,
    },
    // New fields for password reset
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;