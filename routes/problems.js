import express from 'express';
import Problem from '../models/Problem.js';
import verify from '../middlewares/auth.js';

const router = express.Router();

// GET ALL PROBLEMS (for the logged-in user)
router.get('/', verify, async (req, res) => {
    try {
        const problems = await Problem.find({ user: req.user._id });
        res.json(problems);
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

// ADD A NEW PROBLEM
router.post('/', verify, async (req, res) => {
    const problem = new Problem({
        user: req.user._id, // Associate with logged-in user
        question: req.body.question,
        description: req.body.description,
        solution: req.body.solution,
        difficulty: req.body.difficulty,
        category: req.body.category,
        tags: req.body.tags,
        time_complexity: req.body.time_complexity,
        space_complexity: req.body.space_complexity,
        solved: false // Default to false
    });

    try {
        const savedProblem = await problem.save();
        res.json(savedProblem);
    } catch (err) {
        res.status(400).json({ message: err });
    }
});

// MARK AS DONE (Toggle Solved Status)
router.patch('/:id/toggle-solved', verify, async (req, res) => {
    try {
        // Find the problem specifically for this user
        const problem = await Problem.findOne({ _id: req.params.id, user: req.user._id });
        
        if(!problem) return res.status(404).send("Problem not found");

        // Toggle the value
        problem.solved = !problem.solved;
        
        const updatedProblem = await problem.save();
        res.json(updatedProblem);
    } catch (err) {
        res.status(400).json({ message: err });
    }
});

// DELETE PROBLEM
router.delete('/:id', verify, async (req, res) => {
    try {
        const removedProblem = await Problem.deleteOne({ _id: req.params.id, user: req.user._id });
        res.json(removedProblem);
    } catch (err) {
        res.status(400).json({ message: err });
    }
});

export default router;