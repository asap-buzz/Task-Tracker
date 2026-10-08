import { Router } from 'express';
import { body, param } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/error.js';
import { CATEGORIES } from '../models/Quest.js';
import { isValidTimezone } from '../utils/dates.js';
import * as c from '../controllers/miscControllers.js';

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
const id = param('id').isMongoId().withMessage('Invalid id');
const habitBody = (req_) => [
  req_ ? body('title').isString().trim().isLength({ min: 1, max: 120 }).withMessage('Title is required (max 120)') : body('title').optional().isString().trim().isLength({ min: 1, max: 120 }),
  body('description').optional().isString().trim().isLength({ max: 500 }),
  body('category').optional().isIn(CATEGORIES).withMessage('Invalid category'),
];

export const habitRoutes = Router();
habitRoutes.use(requireAuth);
habitRoutes.get('/', wrap(c.listHabits));
habitRoutes.post('/', habitBody(true), validate, wrap(c.createHabit));
habitRoutes.patch('/:id', id, habitBody(false), validate, wrap(c.updateHabit));
habitRoutes.delete('/:id', id, validate, wrap(c.deleteHabit));
habitRoutes.post('/:id/complete', id, validate, wrap(c.completeHabitCtrl));

export const userRoutes = Router();
userRoutes.use(requireAuth);
userRoutes.get('/me', c.getMe);
userRoutes.patch('/me',
  body('username').optional().isString().trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
  body('timezone').optional().custom(isValidTimezone).withMessage('Invalid timezone'), validate, wrap(c.updateMe));
userRoutes.patch('/me/password',
  body('currentPassword').isString().notEmpty().withMessage('Current password required'),
  body('newPassword').isString().isLength({ min: 8, max: 72 }).withMessage('New password must be 8-72 characters'), validate, wrap(c.changePassword));
userRoutes.delete('/me', body('password').isString().notEmpty().withMessage('Password required'), validate, wrap(c.deleteMe));

export const statsRoutes = Router();
statsRoutes.use(requireAuth);
statsRoutes.get('/dashboard', wrap(c.dashboard));
statsRoutes.get('/activity', wrap(c.activity));
