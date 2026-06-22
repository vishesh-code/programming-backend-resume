import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: { 
    type: String, 
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  time: { 
    type: String, 
    default: '' 
  },
  done: { 
    type: Boolean, 
    default: false 
  },
  dateKey: { 
    type: String, 
    required: true // Format: YYYY-MM-DD
  }
}, { timestamps: true });

const Todo = mongoose.model('Todo', todoSchema);
export default Todo;