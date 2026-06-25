import express from 'express';
import StudyTopic from '../models/StudyTopicModel.js';
import StudyChapter from '../models/StudyChapterModel.js';
import StudyNote from '../models/StudyNoteModel.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to protect all study routes
router.use(authMiddleware);

// ==========================================
// 1. GET: FETCH TOPICS FOR THE SIDEBAR
// ==========================================
router.get('/topics', async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // Fetch private topics created by this user
    const privateTopics = await StudyTopic.find({ createdBy: userId, isPublic: false }).lean();
    
    // Fetch all public topics 
    const publicTopics = await StudyTopic.find({ isPublic: true }).lean();

    res.json({
      private: privateTopics,
      public: publicTopics
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 2. GET: FETCH CONTENT (CHAPTERS & NOTES) FOR A SPECIFIC TOPIC
// ==========================================
router.get('/content', async (req, res) => {
  try {
    const { topicId } = req.query;
    
    if (!topicId) {
      return res.status(400).json({ message: "Topic ID is required" });
    }

    // 1. Fetch Chapters for this specific topic, sorted by their order
    const chapters = await StudyChapter.find({ topicId }).sort({ order: 1 }).lean();
    const chapterIds = chapters.map(ch => ch._id);

    // 2. Fetch all Notes that belong to these specific chapters, sorted by order
    const notes = await StudyNote.find({ chapterId: { $in: chapterIds } }).sort({ order: 1 }).lean();

    // 3. Combine them into a nested menu structure
    const menu = chapters.map(chapter => ({
      ...chapter,
      subtopics: notes.filter(note => note.chapterId.toString() === chapter._id.toString())
    }));

    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==========================================
// 3. POST: CREATION ROUTES (For Postman Dummy Data)
// ==========================================

// Create a Main Topic (e.g., "React", "JavaScript")
router.post('/topic', async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    const newTopic = new StudyTopic({
      name: req.body.name,
      isPublic: req.body.isPublic || false,
      createdBy: userId
    });
    
    await newTopic.save();
    res.status(201).json(newTopic);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create a Chapter (e.g., "React Hooks Deep Dive")
router.post('/chapter', async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    // Ensure the parent topic exists
    const topicExists = await StudyTopic.findById(req.body.topicId);
    if (!topicExists) return res.status(404).json({ message: "Topic not found" });

    const newChapter = new StudyChapter({
      topicId: req.body.topicId,
      title: req.body.title,
      order: req.body.order || 0,
      createdBy: userId
    });
    
    await newChapter.save();
    res.status(201).json(newChapter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create a Note/Subtopic (e.g., "Mastering useState")
router.post('/note', async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // Ensure parent chapter exists
    const chapterExists = await StudyChapter.findById(req.body.chapterId);
    if (!chapterExists) return res.status(404).json({ message: "Chapter not found" });

    const newNote = new StudyNote({
      chapterId: req.body.chapterId,
      title: req.body.title,
      content: req.body.content,
      order: req.body.order || 0,
      createdBy: userId
    });
    
    await newNote.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 4. DELETE ROUTES (Optional but good for management)
// ==========================================

// Delete a Note
router.delete('/note/:id', async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const deletedNote = await StudyNote.findOneAndDelete({ _id: req.params.id, createdBy: userId });
    
    if (!deletedNote) return res.status(404).json({ message: "Note not found or unauthorized" });
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;