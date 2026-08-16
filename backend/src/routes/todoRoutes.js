import express from 'express';
import Todo from '../models/Todo.js';

const router = express.Router();

// 1. GET: Fetch all todos (sorted newest first)
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. POST: Create a new todo
router.post('/', async (req, res) => {
  try {
    const todo = new Todo({
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

// 3. PUT: Update a todo's status or title
router.put('/:id', async (req, res) => {
  try {
    const { title, completed, completedAt } = req.body;
    const updateData = {};
    
    if (title !== undefined) updateData.title = title;
    if (completed !== undefined) {
      updateData.completed = completed;
      // Set completedAt to current ISO time if complete, or null out if incomplete
      updateData.completedAt = completed ? (completedAt || new Date().toISOString()) : null;
    }

    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json(updatedTodo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 4. DELETE: Remove a todo
router.delete('/:id', async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    if (!deletedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
