import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required').max(50, 'Category name is too long')
  })
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Category ID is required')
  }),
  body: z.object({
    name: z.string().min(1, 'Category name is required').max(50, 'Category name is too long')
  })
});