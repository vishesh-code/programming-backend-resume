// import express from 'express';
// import Problem from '../models/ProblemModel.js';
// import verify from '../middlewares/authMiddleware.js';

// const router = express.Router();

// // GET ALL PROBLEMS (for the logged-in user)
// router.get('/', verify, async (req, res) => {
//     try {
//         const problems = await Problem.find({ user: req.user._id });
//         res.json(problems);
//     } catch (err) {
//         res.status(500).json({ message: err });
//     }
// });

// // ADD A NEW PROBLEM
// router.post('/', verify, async (req, res) => {
//     const problem = new Problem({
//         user: req.user._id, // Associate with logged-in user
//         question: req.body.question,
//         description: req.body.description,
//         solution: req.body.solution,
//         difficulty: req.body.difficulty,
//         category: req.body.category,
//         tags: req.body.tags,
//         time_complexity: req.body.time_complexity,
//         space_complexity: req.body.space_complexity,
//         solved: false // Default to false
//     });

//     try {
//         const savedProblem = await problem.save();
//         res.json(savedProblem);
//     } catch (err) {
//         res.status(400).json({ message: err });
//     }
// });

// // MARK AS DONE (Toggle Solved Status)
// router.patch('/:id/toggle-solved', verify, async (req, res) => {
//     try {
//         // Find the problem specifically for this user
//         const problem = await Problem.findOne({ _id: req.params.id, user: req.user._id });
        
//         if(!problem) return res.status(404).send("Problem not found");

//         // Toggle the value
//         problem.solved = !problem.solved;
        
//         const updatedProblem = await problem.save();
//         res.json(updatedProblem);
//     } catch (err) {
//         res.status(400).json({ message: err });
//     }
// });

// // DELETE PROBLEM
// router.delete('/:id', verify, async (req, res) => {
//     try {
//         const removedProblem = await Problem.deleteOne({ _id: req.params.id, user: req.user._id });
//         res.json(removedProblem);
//     } catch (err) {
//         res.status(400).json({ message: err });
//     }
// });

// export default router;




import express from 'express';
import mongoose from 'mongoose';
import Problem from '../models/ProblemModel.js';
import verify from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET ALL PROBLEMS (for the logged-in user)
// router.get('/', verify, async (req, res) => {
//   try {
    
//     const problems = await Problem.find({ user: req.user._id })
//       .populate('category', 'name slug')
//       .populate('tags', 'name slug')     
//       .sort({ createdAt: -1 });          

//     res.json(problems);
//   } catch (err) {
//     res.status(500).json({ message: "Server Error", error: err.message });
//   }
// });


// GET ALL PROBLEMS (for the logged-in user)
router.get('/', verify, async (req, res) => {
  try {
    // 1. Support optional pagination from the frontend
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    let query = Problem.find({ user: req.user._id })
      .populate('category', 'name slug') 
      .populate('tags', 'name slug')     
      .sort({ createdAt: -1 });

    // If pagination is requested via API
    if (page && limit) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    // Execute query and count total
    const [problems, total] = await Promise.all([
      query,
      Problem.countDocuments({ user: req.user._id })
    ]);

    // 2. Return an object with both the array and pagination metadata
    res.json({
      problems: problems,
      total: total,
      currentPage: page || 1,
      totalPages: limit ? Math.ceil(total / limit) : 1
    });

  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// ADD A NEW PROBLEM
router.post('/', verify, async (req, res) => {
  const { 
    question, description, solution, difficulty, 
    category, tags, time_complexity, space_complexity 
  } = req.body;

  // 1. Basic Validation
  if (!question || !category) {
    return res.status(400).json({ message: 'Question and Category are required.' });
  }

  // 2. Validate ObjectIds
  if (!mongoose.isValidObjectId(category)) {
    return res.status(400).json({ message: 'Invalid Category ID format.' });
  }

  // 3. Validate Tags (if provided)
  if (tags) {
    if (!Array.isArray(tags)) {
      return res.status(400).json({ message: 'Tags must be an array of IDs.' });
    }
    // Check if every item in the array is a valid ObjectId
    const hasInvalidTag = tags.some(tagId => !mongoose.isValidObjectId(tagId));
    if (hasInvalidTag) {
      return res.status(400).json({ message: 'One or more Tag IDs are invalid.' });
    }
  }

  // 4. Create the Problem
  const problem = new Problem({
    user: req.user._id,
    question,
    description,
    solution,
    difficulty,
    category, 
    tags: tags || [], // Ensure it's an empty array if undefined
    time_complexity,
    space_complexity,
    solved: false
  });

  try {
    const savedProblem = await problem.save();
    
    // 5. Populate the response so the UI can update immediately with names
    const populatedProblem = await savedProblem.populate('category tags');
    
    res.status(201).json(populatedProblem);
  } catch (err) {
    res.status(400).json({ message: "Failed to save problem", error: err.message });
  }
});

// MARK AS DONE (Toggle Solved Status)
router.patch('/:id/toggle-solved', verify, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid Problem ID" });
    }

    const problem = await Problem.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" }); // send json
    }

    // Toggle and save
    problem.solved = !problem.solved;
    await problem.save();
    
    // 🔥 FIX: Only return the ID and the new status to the frontend!
    res.json({ 
      message: "Status updated successfully",
      _id: problem._id,
      solved: problem.solved 
    });
  } catch (err) {
    res.status(400).json({ message: "Error updating status", error: err.message });
  }
});

// DELETE PROBLEM
router.delete('/:id', verify, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid Problem ID" });
    }

    const result = await Problem.deleteOne({ _id: req.params.id, user: req.user._id });
    
    if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Problem not found or unauthorized" });
    }

    res.json({ message: "Problem deleted successfully", result });
  } catch (err) {
    res.status(400).json({ message: "Error deleting problem", error: err.message });
  }
});

export default router;
