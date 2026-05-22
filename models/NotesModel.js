import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Untitled Document'
  },
  content: {
    type: String,
    default: ''
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

const Note = mongoose.model('Note', noteSchema);

export default Note;