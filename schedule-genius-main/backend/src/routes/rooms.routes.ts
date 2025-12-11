import { Router, Response, NextFunction } from 'express';
import { RoomsService } from '../services/rooms.service';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { body, param, validationResult } from 'express-validator';

const router = Router();
const roomsService = new RoomsService();

const validate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all rooms
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const rooms = await roomsService.getAll();
    res.json(rooms);
  } catch (error) {
    next(error);
  }
});

// Get room by ID
router.get(
  '/:id',
  authenticate,
  param('id').isInt(),
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const room = await roomsService.getById(parseInt(req.params.id));
      res.json(room);
    } catch (error) {
      next(error);
    }
  }
);

// Create room (admin only)
router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('type').optional().isString(),
    body('capacity').optional().isInt({ min: 1 }),
    body('equipment').optional().isString(),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const room = await roomsService.create(req.body);
      res.status(201).json(room);
    } catch (error) {
      next(error);
    }
  }
);

// Update room (admin only)
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  [
    param('id').isInt(),
    body('name').optional().notEmpty(),
    body('type').optional().isString(),
    body('capacity').optional().isInt({ min: 1 }),
    body('equipment').optional().isString(),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const room = await roomsService.update(parseInt(req.params.id), req.body);
      res.json(room);
    } catch (error) {
      next(error);
    }
  }
);

// Delete room (admin only)
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  param('id').isInt(),
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await roomsService.delete(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
