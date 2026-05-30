import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createBooth,
  getBooths,
  updateBooth,
  toggleBoothVisibility,
  deleteBooth
} from '../controllers/booth.controller';

const router = Router();

router.post('/', authenticate as any, createBooth as any);
router.get('/', authenticate as any, getBooths as any);
router.patch('/:id', authenticate as any, updateBooth as any);
router.patch('/:id/toggle', authenticate as any, toggleBoothVisibility as any);
router.delete('/:id', authenticate as any, deleteBooth as any);

export default router;
