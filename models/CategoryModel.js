
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,     // no duplicate category names
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,     // no duplicate slugs
    trim: true,
  }
});

const Category = mongoose.model("Category", categorySchema);
export default Category;

