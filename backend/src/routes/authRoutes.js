import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { validate } from '../middleware/error.js';
import { requireAuth } from '../middleware/auth.js';
import * as c from '../controllers/authController.js';

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false,
  message: { message: 'Too many attempts, try again later' } });

// Refresh runs on every page load, so it gets a looser limit than credential endpoints.
const refreshLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false,
  message: { message: 'Too many requests, try again later' } });

const r = Router();
r.post('/register', limiter,
  body('username').isString().trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
  body('email').isString().trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isString().isLength({ min: 8, max: 72 }).withMessage('Password must be 8-72 characters'),
  validate, wrap(c.register));
r.post('/login', limiter,
  body('email').isString().trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password required'),
  validate, wrap(c.login));
r.post('/refresh', refreshLimiter, wrap(c.refresh));
r.post('/logout', wrap(c.logout));
r.get('/me', requireAuth, c.me);
export default r;
