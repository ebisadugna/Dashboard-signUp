import { Request, Response } from 'express';
import Task from '../models/task.model';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate required fields
    if (!req.body.title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    // Create task with validated data
    const taskData = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status || 'todo',
      priority: req.body.priority || 'medium',
      dueDate: req.body.dueDate,
      userId: new mongoose.Types.ObjectId(req.user._id),
      assignedTo: req.body.assignedTo ? new mongoose.Types.ObjectId(req.body.assignedTo) : undefined,
      tags: req.body.tags || []
    };

    const task = new Task(taskData);
    await task.save();

    // Populate assignedTo field if it exists
    if (task.assignedTo) {
      await task.populate('assignedTo', 'name email');
    }

    console.log('Task created successfully:', task);
    res.status(201).json(task);
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(400).json({ 
      error: error.message,
      details: error.errors || {}
    });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { status, priority, search } = req.query;
    
    let query: any = { userId };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } }
      ];
    }
    
    console.log('Fetching tasks with query:', query);
    
    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email')
      .lean();
      
    console.log(`Found ${tasks.length} tasks`);
    res.json(tasks);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.errors || {}
    });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = new mongoose.Types.ObjectId(req.user._id);
    const taskId = new mongoose.Types.ObjectId(req.params.id);

    const task = await Task.findOne({
      _id: taskId,
      userId
    }).populate('assignedTo', 'name email');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error: any) {
    console.error('Error fetching task:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.errors || {}
    });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'status', 'priority', 'dueDate', 'assignedTo', 'tags'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates!' });
    }

    const userId = new mongoose.Types.ObjectId(req.user._id);
    const taskId = new mongoose.Types.ObjectId(req.params.id);

    const task = await Task.findOne({
      _id: taskId,
      userId
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    updates.forEach(update => {
      if (req.body[update] !== undefined) {
        if (update === 'assignedTo' && req.body[update]) {
          (task as any)[update] = new mongoose.Types.ObjectId(req.body[update]);
        } else {
          (task as any)[update] = req.body[update];
        }
      }
    });

    await task.save();
    await task.populate('assignedTo', 'name email');
    res.json(task);
  } catch (error: any) {
    console.error('Error updating task:', error);
    res.status(400).json({ 
      error: error.message,
      details: error.errors || {}
    });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = new mongoose.Types.ObjectId(req.user._id);
    const taskId = new mongoose.Types.ObjectId(req.params.id);

    const task = await Task.findOneAndDelete({
      _id: taskId,
      userId
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error: any) {
    console.error('Error deleting task:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.errors || {}
    });
  }
}; 