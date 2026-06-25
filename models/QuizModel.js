import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
  explanation: { type: String },
  // NEW: Add reference to the User
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Ensure this matches your User model's name
    required: true 
  }
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);