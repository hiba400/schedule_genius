import { Router, Response, NextFunction } from 'express';
import { ModulesService } from '../services/modules.service';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { body, param, validationResult } from 'express-validator';

const router = Router();
const modulesService = new ModulesService();

// Validation middleware
const validate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all modules
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const modules = await modulesService.getAll();
    res.json(modules);
  } catch (error) {
    next(error);
  }
});

// Get module by ID
router.get(
  '/:id',
  authenticate,
  param('id').isInt(),
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const module = await modulesService.getById(parseInt(req.params.id));
      res.json(module);
    } catch (error) {
      next(error);
    }
  }
);

// Create module (admin only)
router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('code').notEmpty().withMessage('Code is required'),
    body('type').isIn(['CM', 'TD', 'TP']).withMessage('Invalid type'),
    body('nature').isIn(['informatique', 'electronique', 'instrumentation', 'mathematiques', 'physique', 'langues', 'gestion', 'autre']).withMessage('Invalid nature'),
    body('hours_cm').optional().isInt({ min: 0 }),
    body('hours_td').optional().isInt({ min: 0 }),
    body('hours_tp').optional().isInt({ min: 0 }),
    body('program_id').optional().isInt(),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const module = await modulesService.create(req.body);
      res.status(201).json(module);
    } catch (error) {
      next(error);
    }
  }
);

// Update module (admin only)
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  [
    param('id').isInt(),
    body('name').optional().notEmpty(),
    body('code').optional().notEmpty(),
    body('type').optional().isIn(['CM', 'TD', 'TP']),
    body('nature').optional().isIn(['informatique', 'electronique', 'instrumentation', 'mathematiques', 'physique', 'langues', 'gestion', 'autre']),
    body('hours_cm').optional().isInt({ min: 0 }),
    body('hours_td').optional().isInt({ min: 0 }),
    body('hours_tp').optional().isInt({ min: 0 }),
    body('program_id').optional().isInt(),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const module = await modulesService.update(parseInt(req.params.id), req.body);
      res.json(module);
    } catch (error) {
      next(error);
    }
  }
);

// Delete module (admin only)
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  param('id').isInt(),
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await modulesService.delete(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;

