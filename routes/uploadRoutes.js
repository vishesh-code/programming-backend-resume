import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import authMiddleware from '../middlewares/authMiddleware.js';
import * as dotenv from 'dotenv';
import File from '../models/FileModel.js'; // <-- 1. Import your new File Model

dotenv.config();

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const file = req.file;
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileName = `${uniquePrefix}-${file.originalname.replace(/\s+/g, '_')}`;

    // 2. Upload to Supabase
    const { error } = await supabase.storage
      .from('uploads')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) throw error;

    // 3. Get the public URL from Supabase
    const { data: publicUrlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    // const fileUrl = publicUrlData.publicUrl;

    // // 4. SAVE TO MONGODB: Create a new file record in the database
    // const newFileRecord = new File({
    //   user: req.user._id, // Gotten from your authMiddleware
    //   fileName: file.originalname,
    //   fileUrl: fileUrl,
    //   fileType: file.mimetype,
    //   size: file.size
    // });

    // const savedFile = await newFileRecord.save();


    const fileUrl = publicUrlData.publicUrl;

    // NEW: Parse tags from the request body (FormData sends them as a string)
    let parsedTags = [];
    if (req.body.tags) {
      try {
        parsedTags = JSON.parse(req.body.tags);
      } catch (e) {
        parsedTags = req.body.tags.split(',').map(t => t.trim());
      }
    }

    // SAVE TO MONGODB: Create a new file record in the database
    const newFileRecord = new File({
      user: req.user._id,
      fileName: file.originalname,
      fileUrl: fileUrl,
      fileType: file.mimetype,
      size: file.size,
      tags: parsedTags
    });

    const savedFile = await newFileRecord.save();

    // 5. Return success and the saved database object
    res.status(201).json({
      success: true,
      message: 'File uploaded and saved to database successfully',
      file: savedFile // Send the full MongoDB document back to the frontend
    });

  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to process file', error: error.message });
  }
});

// --- NEW ROUTE: Get all files for the logged-in user ---
router.get('/my-files', authMiddleware, async (req, res) => {
  try {
    // Find all files belonging to this specific user, sorted by newest first
    const userFiles = await File.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, files: userFiles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch files', error: error.message });
  }
});

export default router;