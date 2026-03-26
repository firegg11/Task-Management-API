import { Request } from 'express';

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  categoryId?: string;
  search?: string;
  dueDate?: Date;
  page?: number;
  limit?: number;
}
