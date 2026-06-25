import mongoose from 'mongoose';

const studyTopicSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "React", "JavaScript"
  isPublic: { type: Boolean, default: false }, // true = Public Study, false = Private Study
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('StudyTopic', studyTopicSchema);