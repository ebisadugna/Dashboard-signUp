import express from 'express';
import { body, validationResult } from 'express-validator';
import Task from '../models/Task.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateTask = [
  body('title').trim().notEmpty(),
  body('status').optional().isIn(['pending', 'in_progress', 'completed']),
  body('dueDate').optional().isISO8601().toDate()
];

// Get all tasks (admin) or user's tasks (regular user)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { userId: req.user._id };
    const tasks = await Task.find(query).populate('userId', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks by user ID (admin only)
router.get('/user/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.params.userId }).populate('userId', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new task
router.post('/', authenticateToken, validateTask, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = new Task({
      ...req.body,
      userId: req.user.role === 'admin' && req.body.userId ? req.body.userId : req.user._id
    });

    await task.save();
    await task.populate('userId', 'name email');
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task
router.put('/:id', authenticateToken, validateTask, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const query = req.user.role === 'admin' 
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.user._id };

    const task = await Task.findOne(query);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    Object.assign(task, req.body);
    await task.save();
    await task.populate('userId', 'name email');
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const query = req.user.role === 'admin' 
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.user._id };

    const task = await Task.findOneAndDelete(query);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 