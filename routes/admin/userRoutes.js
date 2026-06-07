import express from 'express';
import User from '../../models/UsersModel.js';
import Problem from '../../models/ProblemModel.js'; 
import Note from '../../models/NotesModel.js';       
import File from '../../models/FileModel.js';        
import authMiddleware from '../../middlewares/authMiddleware.js';
import isAdmin from '../../middlewares/adminMiddleware.js'; // 🔥 Imported middleware

const router = express.Router();

// 1. GET ALL USERS FOR ADMIN DASHBOARD
// Endpoint: GET /api/admin/users/
router.get('/', [authMiddleware, isAdmin], async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: users.length,
            users: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// 2. DEACTIVATE / REACTIVATE USER API
// Endpoint: PUT /api/admin/users/:id/deactivate
router.put('/:id/deactivate', [authMiddleware, isAdmin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.email === process.env.ADMIN_EMAIL) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate the super admin account.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}`, 
      isActive: user.isActive 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// 3. PERMANENTLY DELETE USER API
// Endpoint: DELETE /api/admin/users/:id
router.delete('/:id', [authMiddleware, isAdmin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.email === process.env.ADMIN_EMAIL) {
      return res.status(400).json({ success: false, message: 'Cannot delete the super admin account.' });
    }

    await Problem.deleteMany({ user: user._id });
    await Note.deleteMany({ user: user._id });
    await File.deleteMany({ user: user._id });

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'User and all associated data permanently deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;