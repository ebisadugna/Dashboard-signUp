import express from 'express';
import { authenticate } from '../middleware/auth';
import Task from '../models/task.model';

const router = express.Router();

// All routes are protected and require authentication
router.use(authenticate);

// Create a new task
router.post('/', async (req, res, next) => {
  try {
    console.log('[Create Task] Request body:', req.body);
    console.log('[Create Task] User:', req.user);
    const task = new Task({
      ...req.body,
      userId: req.user._id
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('[Create Task] Error:', error);
    next(error);
  }
});

// Get all tasks for the authenticated user
router.get('/', async (req, res, next) => {
  try {
    console.log('[Get Tasks] Query:', req.query);
    console.log('[Get Tasks] User:', req.user);
    const tasks = await Task.find({ userId: req.user._id });
    res.json(tasks);
  } catch (error) {
    console.error('[Get Tasks] Error:', error);
    next(error);
  }
});

// Get a specific task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a task
router.patch('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 