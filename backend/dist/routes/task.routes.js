import express from 'express';
import { authenticateToken } from '../middleware/auth';
import Task from '../models/task.model';
const router = express.Router();
// Middleware to log requests
router.use((req, res, next) => {
    console.log(`[Task Route] ${req.method} ${req.path}`, {
        body: req.body,
        query: req.query,
        user: req.user
    });
    next();
});
// Middleware to check task ownership
const checkTaskOwnership = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (task.userId.toString() !== req.user?._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to access this task' });
        }
        next();
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
// Create task
router.post('/', authenticateToken, async (req, res) => {
    try {
        console.log('[Create Task] User:', req.user);
        const task = new Task({
            ...req.body,
            userId: req.user?._id
        });
        await task.save();
        res.status(201).json(task);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Get all tasks for user
router.get('/', authenticateToken, async (req, res) => {
    try {
        console.log('[Get Tasks] User:', req.user);
        const tasks = await Task.find({ userId: req.user?._id });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get single task
router.get('/:id', authenticateToken, checkTaskOwnership, async (req, res) => {
    res.json(await Task.findById(req.params.id));
});
// Update task
router.patch('/:id', authenticateToken, checkTaskOwnership, async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(task);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Delete task
router.delete('/:id', authenticateToken, checkTaskOwnership, async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Task deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
export default router;
