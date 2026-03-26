import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export class TaskController {
  async createTask(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const { title, description, status, priority, dueDate, categoryId } = req.body;
      
      const task = await prisma.task.create({
        data: {
          title,
          description,
          status: status || 'pending',
          priority: priority || 'medium',
          dueDate: dueDate ? new Date(dueDate) : null,
          categoryId,
          userId
        },
        include: { category: true }
      });
      
      res.status(201).json(task);
    } catch (error: any) {
      console.error('Create task error:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  async getTasks(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const { status, priority, categoryId, search, page = 1, limit = 10 } = req.query;
      
      const where: any = { userId };
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (categoryId) where.categoryId = categoryId;
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ];
      }
      
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);
      
      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          where,
          include: { category: true },
          skip,
          take,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.task.count({ where })
      ]);
      
      res.json({
        tasks,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error: any) {
      console.error('Get tasks error:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  async getTaskById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const { id } = req.params;
      
      const task = await prisma.task.findFirst({
        where: { id, userId },
        include: { category: true }
      });
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json(task);
    } catch (error: any) {
      console.error('Get task error:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  async updateTask(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const { id } = req.params;
      const { title, description, status, priority, dueDate, categoryId } = req.body;
      
      const existingTask = await prisma.task.findFirst({
        where: { id, userId }
      });
      
      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      const task = await prisma.task.update({
        where: { id },
        data: {
          title: title !== undefined ? title : existingTask.title,
          description: description !== undefined ? description : existingTask.description,
          status: status || existingTask.status,
          priority: priority || existingTask.priority,
          dueDate: dueDate ? new Date(dueDate) : existingTask.dueDate,
          categoryId: categoryId !== undefined ? categoryId : existingTask.categoryId
        },
        include: { category: true }
      });
      
      res.json(task);
    } catch (error: any) {
      console.error('Update task error:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  async deleteTask(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const { id } = req.params;
      
      const existingTask = await prisma.task.findFirst({
        where: { id, userId }
      });
      
      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      await prisma.task.delete({ where: { id } });
      
      res.json({ message: 'Task deleted successfully' });
    } catch (error: any) {
      console.error('Delete task error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
