import mongoose from 'mongoose';

const studyChapterSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyTopic', required: true }, // Links to the main Topic
  title: { type: String, required: true }, // e.g., "React Hooks Deep Dive"
  order: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('StudyChapter', studyChapterSchema);