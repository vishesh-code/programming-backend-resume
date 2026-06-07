import express from 'express';
import Note from '../../models/NotesModel.js';        
import authMiddleware from '../../middlewares/authMiddleware.js';
import isAdmin from '../../middlewares/adminMiddleware.js';

const router = express.Router();

// 1. GET ALL NOTES
// Endpoint: GET /api/admin/notes/
router.get('/', [authMiddleware, isAdmin], async (req, res) => {
    try {
        // Fetch all notes and populate the user details (to see who wrote it)
        const notes = await Note.find()
            .populate('user', 'email') 
            .sort({ updatedAt: -1 }); // Sort by most recently updated

        res.status(200).json({ 
            success: true, 
            count: notes.length, 
            notes: notes 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching notes', error: error.message });
    }
});

// 2. DELETE A NOTE
// Endpoint: DELETE /api/admin/notes/:id
router.delete('/:id', [authMiddleware, isAdmin], async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

        // Delete the note from the database
        await Note.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while deleting note', error: error.message });
    }
});

export default router;