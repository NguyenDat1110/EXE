import { Router } from 'express';
import { getBoothDetail, getBoothsByCategory, getExploreCategories } from '../controllers/explore.controller';

const router = Router();

router.get('/categories', getExploreCategories as any);
router.get('/booths', getBoothsByCategory as any);
router.get('/booths/:boothId', getBoothDetail as any);

export default router;
