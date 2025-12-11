import { Router, Response, NextFunction } from 'express';
import { ProgramsService } from '../services/programs.service';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { body, param, validationResult } from 'express-validator';

const router = Router();
const programsService = new ProgramsService();

const validate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all programs
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const programs = await programsService.getAll();
    res.json(programs);
  } catch (error) {
    next(error);
  }
});

// Get program by ID
router.get(
  '/:id',
  authenticate,
  param('id').isInt(),
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const program = await programsService.getById(parseInt(req.params.id));
      res.json(program);
    } catch (error) {
      next(error);
    }
  }
);

// Create program (admin only)
router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('level').optional().isString(),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const program = await programsService.create(req.body);
      res.status(201).json(program);
    } catch (error) {
      next(error);
    }
  }
);

// Update program (admin only)
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  [
    param('id').isInt(),
    body('name').optional().notEmpty(),
    body('level').optional().isString(),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const program = await programsService.update(parseInt(req.params.id), req.body);
      res.json(program);
    } catch (error) {
      next(error);
    }
  }
);

// Delete program (admin only)
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  param('id').isInt(),
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await programsService.delete(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
