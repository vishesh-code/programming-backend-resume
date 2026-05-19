// import mongoose from 'mongoose';
// const tagSchema = new mongoose.Schema({
//   name: { type: String, required: true, unique: true },
//   slug: { type: String, required: true, unique: true }
//   // no timestamps option here
// });

// const Tag = mongoose.model('Tag', tagSchema);
// export default Tag;



import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  // Add reference to parent Category
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
    required: true 
  }
});

// Compound unique index to ensure unique tags PER category
// (e.g., 'Easy' tag can exist in both 'Array' and 'String' categories)
tagSchema.index({ name: 1, category: 1 }, { unique: true });
tagSchema.index({ slug: 1, category: 1 }, { unique: true });

const Tag = mongoose.model('Tag', tagSchema);

export default Tag;
