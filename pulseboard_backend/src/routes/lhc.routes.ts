import { Router } from 'express';
import { getHeatmap } from '../controllers/lhc.controller';

const router = Router();

router.get('/heatmap', getHeatmap);

export default router;
