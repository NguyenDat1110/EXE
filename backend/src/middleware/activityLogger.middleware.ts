import { Request, Response, NextFunction } from 'express';
import { ActivityLog } from '../models/activityLog.model';
import { AuthRequest } from './auth.middleware';

export const logActivity = (action: string, resource: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode < 400) {
        const authReq = req as AuthRequest;
        ActivityLog.create({
          userId: authReq.user?.id,
          action,
          resource,
          resourceId: req.params.id || req.params.vendorId || req.params.userId || req.params.bookingId,
          details: { method: req.method, path: req.path, statusCode: res.statusCode },
          ip: req.ip || (req.socket as any)?.remoteAddress,
          userAgent: req.get('User-Agent')
        }).catch(err => console.error('Log activity error:', err));
      }
      return originalJson(body);
    };
    next();
  };
};
