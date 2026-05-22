import express from 'express';
import Note from '../models/NotesModel.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// 1. GET ALL NOTES for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notes', error: error.message });
  }
});

// 2. CREATE A NEW NOTE
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newNote = new Note({
      user: req.user._id,
      title: req.body.title || 'Untitled Document',
      content: req.body.content || ''
    });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create note', error: error.message });
  }
});


// 3. UPDATE AN EXISTING NOTE
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, 
      { title: req.body.title, content: req.body.content },
      { returnDocument: 'after' } // <--- CHANGED THIS LINE
    );
    
    if (!updatedNote) return res.status(404).json({ message: 'Note not found' });
    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update note', error: error.message });
  }
});

// 4. DELETE A NOTE
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletedNote = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deletedNote) return res.status(404).json({ message: 'Note not found' });
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete note', error: error.message });
  }
});

export default router;