import prisma from '../utils/prisma';

export class CategoryService {
  async createCategory(userId: string, name: string) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        userId
      }
    });

    if (existingCategory) {
      throw new Error('Category already exists');
    }

    const category = await prisma.category.create({
      data: {
        name,
        userId
      }
    });

    return category;
  }

  async getCategories(userId: string) {
    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return categories;
  }

  async getCategoryById(userId: string, categoryId: string) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId
      },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  async updateCategory(userId: string, categoryId: string, name: string) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId
      }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        userId,
        NOT: { id: categoryId }
      }
    });

    if (existingCategory) {
      throw new Error('Category name already exists');
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { name }
    });

    return updatedCategory;
  }

  async deleteCategory(userId: string, categoryId: string) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId
      }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    await prisma.category.delete({
      where: { id: categoryId }
    });

    return { message: 'Category deleted successfully' };
  }
}