import prisma from '../utils/prisma';
import { TaskFilters } from '../types';

export class TaskService {
  async createTask(userId: string, data: any) {
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          userId
        }
      });

      if (!category) {
        throw new Error('Category not found');
      }
    }

    const task = await prisma.task.create({
      data: {
        ...data,
        userId
      },
      include: {
        category: true
      }
    });

    return task;
  }

  async getTasks(userId: string, filters: TaskFilters) {
    const { status, priority, categoryId, search, page = 1, limit = 10 } = filters;
    
    const where: any = { userId };
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          category: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.task.count({ where })
    ]);
    
    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getTaskById(userId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId
      },
      include: {
        category: true
      }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    return task;
  }

  async updateTask(userId: string, taskId: string, data: any) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId
      }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          userId
        }
      });

      if (!category) {
        throw new Error('Category not found');
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data,
      include: {
        category: true
      }
    });

    return updatedTask;
  }

  async deleteTask(userId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId
      }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    return { message: 'Task deleted successfully' };
  }
}