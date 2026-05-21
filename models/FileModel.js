import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  fileName: {
    type: String,
    required: true 
  },
  fileUrl: {
    type: String,
    required: true 
  },
  fileType: {
    type: String,
    required: true 
  },
  size: {
    type: Number,
    required: true 
  },
  // NEW: Store tags as an array of strings
  tags: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });

const File = mongoose.model('File', fileSchema);

export default File;