import express from 'express';
import Todo from '../models/TodoModel.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET all todos for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id });
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch todos', error: error.message });
  }
});

// ADD a new todo
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { text, priority, time, dateKey } = req.body;
    const newTodo = new Todo({
      user: req.user._id,
      text,
      priority,
      time,
      dateKey
    });
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add todo', error: error.message });
  }
});

// UPDATE a todo (Edit text, change priority, or toggle 'done' status)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!updatedTodo) return res.status(404).json({ message: 'Todo not found' });
    res.status(200).json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update todo', error: error.message });
  }
});

// DELETE a todo
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletedTodo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deletedTodo) return res.status(404).json({ message: 'Todo not found' });
    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete todo', error: error.message });
  }
});

export default router;