import mongoose from "mongoose"

const problemSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    question: { type: String, required: true },
    description: { type: String },
    solution: { type: String },
    difficulty: { 
        type: String, 
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium' 
    },
    category: { type: String },
    tags: [String],
    time_complexity: { type: String },
    space_complexity: { type: String },
    solved: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true }); // 👈 This enables default 'createdAt' and 'updatedAt'

const Problem = mongoose.model('Problem', problemSchema);
export default Problem;