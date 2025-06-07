import express from 'express';
import { createTask, getTasks, getTaskById, updateTask, deleteTask } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';

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

// All routes are protected and require authentication
router.use(authenticate);

// Create a new task
router.post('/', async (req, res, next) => {
  try {
    console.log('[Create Task] Request body:', req.body);
    console.log('[Create Task] User:', req.user);
    await createTask(req, res);
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
    await getTasks(req, res);
  } catch (error) {
    console.error('[Get Tasks] Error:', error);
    next(error);
  }
});

// Get a specific task by ID
router.get('/:id', getTaskById);

// Update a task
router.patch('/:id', updateTask);

// Delete a task
router.delete('/:id', deleteTask);

export default router; 