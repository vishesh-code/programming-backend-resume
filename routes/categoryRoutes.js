// routes/category.routes.js
import express from "express";
import mongoose from "mongoose";
import Category from "../models/CategoryModel.js";

const router = express.Router();

// GET all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// CREATE category
router.post("/", async (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name || !slug) {
      return res
        .status(400)
        .json({ message: "name and slug are required" });
    }

    const category = await Category.create({ name, slug });
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Category name or slug already exists" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE category
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name, slug },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Category name or slug already exists" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE category
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
