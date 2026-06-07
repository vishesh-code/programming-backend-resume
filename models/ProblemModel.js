// import mongoose from "mongoose"

// const problemSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     question: { type: String, required: true },
//     description: { type: String },
//     solution: { type: String },
//     difficulty: { 
//         type: String, 
//         enum: ['Easy', 'Medium', 'Hard'],
//         default: 'Medium' 
//     },
//     category: { type: String },
//     tags: [String],
//     time_complexity: { type: String },
//     space_complexity: { type: String },
//     solved: { 
//         type: Boolean, 
//         default: false 
//     }
// }, { timestamps: true }); // 👈 This enables default 'createdAt' and 'updatedAt'

// const Problem = mongoose.model('Problem', problemSchema);
// export default Problem;




// import mongoose from 'mongoose';

// const problemSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   question: { type: String, required: true },
//   description: { type: String },
//   solution: { type: String },
//   difficulty: {
//     type: String,
//     enum: ['Easy', 'Medium', 'Hard'],
//     default: 'Medium'
//   },
//   // --- FIX STARTS HERE ---
//   category: { 
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category',
//     required: true 
//   },
//   tags: [{ 
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Tag' 
//   }],
//   // --- FIX ENDS HERE ---
//   time_complexity: { type: String },
//   space_complexity: { type: String },
//   solved: {
//     type: Boolean,
//     default: false
//   },
//   solvedAt: { type: Date, default: null }
// }, { timestamps: true });

// const Problem = mongoose.model('Problem', problemSchema);

// export default Problem;



import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: { type: String, required: true },
  description: { type: String },
  
  // --- UPDATED: Replaced 'solution' string with 'solutions' array ---
  solutions: [{
    title: { type: String, required: true, default: 'Approach 1' }, // e.g., "Brute Force" or "Optimized"
    code: { type: String, required: true },
    language: { type: String, default: 'javascript' } // Optional: useful if you add multi-language support
  }],
  // ----------------------------------------------------------------

  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true 
  },
  tags: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag' 
  }],
  time_complexity: { type: String },
  space_complexity: { type: String },
  solved: {
    type: Boolean,
    default: false
  },
  solvedAt: { type: Date, default: null }
}, { timestamps: true });

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;