import { Router, Response, NextFunction } from 'express';
import { GroupsService } from '../services/groups.service';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { body, param, query, validationResult } from 'express-validator';

const router = Router();
const groupsService = new GroupsService();

const validate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all groups
router.get(
  '/',
  authenticate,
  query('program_id').optional().isInt(),
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const programId = req.query.program_id as string;
      const groups = programId
        ? await groupsService.getByProgram(parseInt(programId))
        : await groupsService.getAll();
      res.json(groups);
    } catch (error) {
      next(error);
    }
  }
);

// Get group by ID
router.get(
  '/:id',
  authenticate,
  param('id').isInt(),
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const group = await groupsService.getById(parseInt(req.params.id));
      res.json(group);
    } catch (error) {
      next(error);
    }
  }
);

// Create group (admin only)
router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('program_id').isInt().withMessage('Valid program_id is required'),
    body('size').optional().isInt({ min: 1 }),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const group = await groupsService.create(req.body);
      res.status(201).json(group);
    } catch (error) {
      next(error);
    }
  }
);

// Update group (admin only)
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  [
    param('id').isInt(),
    body('name').optional().notEmpty(),
    body('program_id').optional().isInt(),
    body('size').optional().isInt({ min: 1 }),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const group = await groupsService.update(parseInt(req.params.id), req.body);
      res.json(group);
    } catch (error) {
      next(error);
    }
  }
);

// Delete group (admin only)
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  param('id').isInt(),
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await groupsService.delete(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
