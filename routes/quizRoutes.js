import express from 'express';
import Quiz from '../models/QuizModel.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // Ensure path is correct

const router = express.Router();

// Apply auth middleware to ALL routes in this file
// This ensures we always have the logged-in user's ID from the token
router.use(authMiddleware);

// 1. GET: Fetch ONLY the logged-in user's questions
router.get('/', async (req, res) => {
  try {
    const { topics, difficulty } = req.query;
    
    // IMPORTANT: Get user ID from the token payload attached by your auth middleware
    // Note: Depending on your auth token structure, this might be req.user._id instead
    const userId = req.user.id || req.user._id; 

    // Base query: Fetch ONLY questions created by this user
    let query = { createdBy: userId };

    if (topics && topics !== 'All') {
      const topicsArray = topics.split(',');
      query.topic = { $in: topicsArray };
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    const questions = await Quiz.find(query);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. POST: Add a new question (Automatically assign to current user)
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // Merge the incoming body with the createdBy field
    const newQuestion = new Quiz({
      ...req.body,
      createdBy: userId
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. PUT: Edit an existing question (Ensure they own it)
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    const updatedQuestion = await Quiz.findOneAndUpdate(
      { _id: req.params.id, createdBy: userId }, // Verify ownership before updating
      req.body, 
      { new: true }
    );

    if (!updatedQuestion) return res.status(404).json({ message: "Question not found or unauthorized" });
    res.json(updatedQuestion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. DELETE: Remove a question (Ensure they own it)
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const deletedQuestion = await Quiz.findOneAndDelete({ _id: req.params.id, createdBy: userId });
    
    if (!deletedQuestion) return res.status(404).json({ message: "Question not found or unauthorized" });
    res.json({ message: "Question deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;