


import express from "express";
import tagModel from "../models/tagsModel.js";
import mongoose from "mongoose";

const router = express.Router();

// GET tags (optionally filter by categoryId)
// Usage: /api/tags or /api/tags?categoryId=12345
router.get("/", async (req, res) => {
  try {
    const { categoryId } = req.query;
    
    // Build filter object
    const filter = {};
    if (categoryId && mongoose.isValidObjectId(categoryId)) {
      filter.category = categoryId;
    }

    // Fetch tags and populate category name if needed
    const tagsData = await tagModel
      .find(filter)
      .sort({ name: 1 })
      .populate('category', 'name slug'); // Optional: populate parent category details

    res.json(tagsData);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// CREATE tag (now requires categoryId)
router.post("/", async (req, res) => {
  try {
    const { name, slug, categoryId } = req.body;

    if (!name || !slug || !categoryId) {
      return res.status(400).json({ message: "name, slug, and categoryId are required" });
    }

    if (!mongoose.isValidObjectId(categoryId)) {
      return res.status(400).json({ message: "Invalid categoryId" });
    }

    const tag = await tagModel.create({ 
      name, 
      slug, 
      category: categoryId 
    });
    
    res.status(201).json(tag);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Tag already exists in this category" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE tag
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, categoryId } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const updateData = { name, slug };
    if (categoryId) {
        if(!mongoose.isValidObjectId(categoryId)) {
             return res.status(400).json({ message: "Invalid categoryId" });
        }
        updateData.category = categoryId;
    }

    const tagData = await tagModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!tagData) {
      return res.status(404).json({ message: "Tag not found" });
    }
    res.json(tagData);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Tag name/slug already exists in this category" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE tag
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const tagData = await tagModel.findByIdAndDelete(id);

    if (!tagData) {
      return res.status(404).json({ message: "Tag not found" });
    }
    res.json({ message: "Tag deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
