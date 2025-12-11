import { Router, Response, NextFunction } from 'express';
import { ProfessorsService } from '../services/professors.service';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { body, param, validationResult } from 'express-validator';

const router = Router();
const professorsService = new ProfessorsService();

const validate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all professors
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const professors = await professorsService.getAll();
    res.json(professors);
  } catch (error) {
    next(error);
  }
});

// Get professor by ID
router.get(
  '/:id',
  authenticate,
  param('id').isInt(),
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const professor = await professorsService.getById(parseInt(req.params.id));
      res.json(professor);
    } catch (error) {
      next(error);
    }
  }
);

// Get professor availability
router.get(
  '/:id/availability',
  authenticate,
  param('id').isInt(),
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const availability = await professorsService.getAvailability(parseInt(req.params.id));
      res.json(availability);
    } catch (error) {
      next(error);
    }
  }
);

// Create professor (admin only)
router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('specialties').optional().isString(),
    body('max_hours').optional().isInt({ min: 1, max: 40 }),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const professor = await professorsService.create(req.body);
      res.status(201).json(professor);
    } catch (error) {
      next(error);
    }
  }
);

// Update professor (admin only)
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  [
    param('id').isInt(),
    body('name').optional().notEmpty(),
    body('email').optional().isEmail(),
    body('specialties').optional().isString(),
    body('max_hours').optional().isInt({ min: 1, max: 40 }),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const professor = await professorsService.update(parseInt(req.params.id), req.body);
      res.json(professor);
    } catch (error) {
      next(error);
    }
  }
);

// Update professor availability (admin only)
router.put(
  '/:id/availability',
  authenticate,
  requireAdmin,
  [
    param('id').isInt(),
    body('availability').isArray().withMessage('Availability array is required'),
    body('availability.*.day_of_week').isInt({ min: 1, max: 7 }),
    body('availability.*.slot_index').isInt({ min: 0 }),
    body('availability.*.available').isBoolean(),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await professorsService.updateAvailability(parseInt(req.params.id), req.body.availability);
      res.json({ message: 'Availability updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Delete professor (admin only)
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  param('id').isInt(),
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await professorsService.delete(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
