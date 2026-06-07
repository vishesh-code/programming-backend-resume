import express from 'express';
import { createClient } from '@supabase/supabase-js';
import File from '../../models/FileModel.js';        
import authMiddleware from '../../middlewares/authMiddleware.js';
import isAdmin from '../../middlewares/adminMiddleware.js'; // 🔥 Imported middleware

const router = express.Router();

// Initialize Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. GET ALL FILES
// Endpoint: GET /api/admin/files/
router.get('/', [authMiddleware, isAdmin], async (req, res) => {
    try {
        const files = await File.find()
            .populate('user', 'email') 
            .sort({ createdAt: -1 });

        res.status(200).json({ 
            success: true, 
            count: files.length, 
            files: files 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching files', error: error.message });
    }
});

// 2. DELETE A FILE
// Endpoint: DELETE /api/admin/files/:id
router.delete('/:id', [authMiddleware, isAdmin], async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) return res.status(404).json({ success: false, message: 'File not found' });

        const urlParts = file.fileUrl.split('/uploads/');
        
        if (urlParts.length === 2) {
            const supabaseFileName = urlParts[1];
            
            const { error: supabaseError } = await supabase.storage
                .from('uploads') 
                .remove([supabaseFileName]);

            if (supabaseError) {
                console.error("Supabase deletion error:", supabaseError);
            }
        }

        await File.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'File deleted successfully from database and storage' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while deleting file', error: error.message });
    }
});

export default router;