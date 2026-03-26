import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export class CategoryController {
  async createCategory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const { name } = req.body;
      
      const existingCategory = await prisma.category.findFirst({
        where: { name, userId }
      });
      
      if (existingCategory) {
        return res.status(400).json({ error: 'Category already exists' });
      }
      
      const category = await prisma.category.create({
        data: { name, userId }
      });
      
      res.status(201).json(category);
    } catch (error: any) {
      console.error('Create category error:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  async getCategories(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const categories = await prisma.category.findMany({
        where: { userId },
        include: {
          _count: { select: { tasks: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json(categories);
    } catch (error: any) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  async getCategoryById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const { id } = req.params;
      
      const category = await prisma.category.findFirst({
        where: { id, userId },
        include: { tasks: { orderBy: { createdAt: 'desc' } } }
      });
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json(category);
    } catch (error: any) {
      console.error('Get category error:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  async updateCategory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const { id } = req.params;
      const { name } = req.body;
      
      const existingCategory = await prisma.category.findFirst({
        where: { id, userId }
      });
      
      if (!existingCategory) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      const nameConflict = await prisma.category.findFirst({
        where: { name, userId, NOT: { id } }
      });
      
      if (nameConflict) {
        return res.status(400).json({ error: 'Category name already exists' });
      }
      
      const category = await prisma.category.update({
        where: { id },
        data: { name }
      });
      
      res.json(category);
    } catch (error: any) {
      console.error('Update category error:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  async deleteCategory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const { id } = req.params;
      
      const existingCategory = await prisma.category.findFirst({
        where: { id, userId }
      });
      
      if (!existingCategory) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      await prisma.task.updateMany({
        where: { categoryId: id },
        data: { categoryId: null }
      });
      
      await prisma.category.delete({ where: { id } });
      
      res.json({ message: 'Category deleted successfully' });
    } catch (error: any) {
      console.error('Delete category error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
