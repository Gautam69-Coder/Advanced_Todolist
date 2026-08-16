import express from 'express';
import Todo from '../models/Todo.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all todo routes below this line
router.use(authMiddleware);

// 1. GET: Fetch all todos for the authenticated user (sorted newest first)
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. POST: Create a new todo for the authenticated user
router.post('/', async (req, res) => {
  try {
    const todo = new Todo({
      user: req.userId,
      title: req.body.title,
      completed: false,
      createdAt: new Date().toISOString(),
    });
    const newTodo = await todo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 3. PUT: Update a todo's status or title (only if owned by authenticated user)
router.put('/:id', async (req, res) => {
  try {
    const { title, completed, completedAt } = req.body;
    const updateData = {};
    
    if (title !== undefined) updateData.title = title;
    if (completed !== undefined) {
      updateData.completed = completed;
      updateData.completedAt = completed ? (completedAt || new Date().toISOString()) : null;
    }

    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo not found or unauthorized' });
    }

    res.json(updatedTodo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 4. DELETE: Remove a todo (only if owned by authenticated user)
router.delete('/:id', async (req, res) => {
  try {
    const deletedTodo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deletedTodo) {
      return res.status(404).json({ message: 'Todo not found or unauthorized' });
    }
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
