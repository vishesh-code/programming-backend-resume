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
import User from '../models/UsersModel.js'; // <-- ADD THIS IMPORT
const router = express.Router();


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
// router.post('/', verify, async (req, res) => {
//   const { 
//     question, description, solution, difficulty, 
//     category, tags, time_complexity, space_complexity 
//   } = req.body;

//   // 1. Basic Validation
//   if (!question || !category) {
//     return res.status(400).json({ message: 'Question and Category are required.' });
//   }

//   // 2. Validate ObjectIds
//   if (!mongoose.isValidObjectId(category)) {
//     return res.status(400).json({ message: 'Invalid Category ID format.' });
//   }

//   // 3. Validate Tags (if provided)
//   if (tags) {
//     if (!Array.isArray(tags)) {
//       return res.status(400).json({ message: 'Tags must be an array of IDs.' });
//     }
//     // Check if every item in the array is a valid ObjectId
//     const hasInvalidTag = tags.some(tagId => !mongoose.isValidObjectId(tagId));
//     if (hasInvalidTag) {
//       return res.status(400).json({ message: 'One or more Tag IDs are invalid.' });
//     }
//   }

//   // 4. Create the Problem
//   const problem = new Problem({
//     user: req.user._id,
//     question,
//     description,
//     solution,
//     difficulty,
//     category, 
//     tags: tags || [], // Ensure it's an empty array if undefined
//     time_complexity,
//     space_complexity,
//     solved: false
//   });

//   try {
//     const savedProblem = await problem.save();
    
//     // 5. Populate the response so the UI can update immediately with names
//     const populatedProblem = await savedProblem.populate('category tags');
    
//     res.status(201).json(populatedProblem);
//   } catch (err) {
//     res.status(400).json({ message: "Failed to save problem", error: err.message });
//   }
// });




// ADD A NEW PROBLEM
router.post('/', verify, async (req, res) => {
  const { 
    question, description, solutions, difficulty, // <-- Changed 'solution' to 'solutions'
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
    solutions: solutions || [], // <-- Assign the solutions array here
    difficulty,
    category, 
    tags: tags || [],
    time_complexity,
    space_complexity,
    solved: false
  });

  try {
    const savedProblem = await problem.save();
    const populatedProblem = await savedProblem.populate('category tags');
    res.status(201).json(populatedProblem);
  } catch (err) {
    res.status(400).json({ message: "Failed to save problem", error: err.message });
  }
});


// UPDATE A PROBLEM (Add new solutions, edit details, etc.)
router.put('/:id', verify, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid Problem ID" });
    }

    // Find the problem for this user and update it
    const updatedProblem = await Problem.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body }, // Applies any updates passed in the body (like adding to the solutions array)
      { new: true, runValidators: true } // Returns the updated document
    ).populate('category tags');

    if (!updatedProblem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res.json(updatedProblem);
  } catch (err) {
    res.status(400).json({ message: "Error updating problem", error: err.message });
  }
});



// MARK AS DONE (Toggle Solved Status)
router.patch('/:id/toggle-solved', verify, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ID" });

    const problem = await Problem.findOne({ _id: req.params.id, user: req.user._id });
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    // Toggle status
    problem.solved = !problem.solved;
    
    // 🔥 If marked solved, record the date. If unmarked, clear the date.
    if (problem.solved) {
      problem.solvedAt = new Date();
    } else {
      problem.solvedAt = null;
    }
    
    await problem.save();
    
    res.json({ message: "Status updated", _id: problem._id, solved: problem.solved });
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



// UPDATE TARGET GOAL
router.put('/goal', verify, async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal || goal < 1) return res.status(400).json({ message: "Invalid goal" });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { targetGoal: goal },
      { new: true }
    );
    res.json({ message: "Goal updated", targetGoal: user.targetGoal });
  } catch (err) {
    res.status(500).json({ message: "Error updating goal", error: err.message });
  }
});


// GET PROBLEM STATS
router.get('/stats', verify, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const targetGoal = user ? user.targetGoal : 50;
    
    // 🔥 Fetch solved problems (including the new solvedAt field)
    const solvedProblems = await Problem.find({ user: userId, solved: true }, 'difficulty solvedAt updatedAt');

    let easy = 0, medium = 0, hard = 0;
    solvedProblems.forEach(p => {
      if (p.difficulty === 'Easy') easy++;
      else if (p.difficulty === 'Medium') medium++;
      else if (p.difficulty === 'Hard') hard++;
    });

    // Weekly Activity
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    const weeklyActivity = [];
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const nextDay = new Date(d);
      nextDay.setDate(d.getDate() + 1);

      const solvedOnDay = solvedProblems.filter(p => {
         // Fallback to updatedAt for old data before you added this field!
         const dateToUse = p.solvedAt ? new Date(p.solvedAt) : new Date(p.updatedAt);
         return dateToUse >= d && dateToUse < nextDay;
      }).length;

      weeklyActivity.push({ 
        day: dayNames[d.getDay()], 
        date: d.getDate(), // 🔥 Pass the actual date number (e.g., 23)
        count: solvedOnDay, 
        active: solvedOnDay > 0 
      });
    }

    // Current Streak Calculation
    const uniqueSolvedDates = [...new Set(solvedProblems.map(p => {
      const dateToUse = p.solvedAt ? new Date(p.solvedAt) : new Date(p.updatedAt);
      return dateToUse.setHours(0,0,0,0);
    }))].sort((a,b) => b - a);

    let currentStreak = 0;
    let checkDate = new Date(today).getTime();

    for (let i = 0; i < uniqueSolvedDates.length; i++) {
      if (uniqueSolvedDates[i] === checkDate) {
        currentStreak++; checkDate -= 86400000; 
      } else if (uniqueSolvedDates[i] === checkDate - 86400000 && currentStreak === 0) {
         currentStreak++; checkDate -= 86400000 * 2;
      } else break; 
    }

    res.json({ targetGoal, solved: solvedProblems.length, easy, medium, hard, weeklyActivity, streak: currentStreak });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
});

export default router;
