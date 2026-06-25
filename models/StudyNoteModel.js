import mongoose from 'mongoose';

const studyNoteSchema = new mongoose.Schema({
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyChapter', required: true }, // Links to the Chapter
  title: { type: String, required: true }, // e.g., "1. Mastering useState"
  content: { type: String, required: true }, // The Markdown content
  order: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('StudyNote', studyNoteSchema);