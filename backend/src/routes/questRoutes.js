import { Router } from 'express';
import { body, param } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/error.js';
import { CATEGORIES, DIFFICULTIES } from '../models/Quest.js';
import * as c from '../controllers/questController.js';

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
const id = param('id').isMongoId().withMessage('Invalid quest id');
const fields = (optional) => {
  const o = (chain) => chain.optional(); // only title is required on create
  return [
    optional ? body('title').optional().isString().trim().isLength({ min: 1, max: 120 }) : body('title').isString().trim().isLength({ min: 1, max: 120 }).withMessage('Title is required (max 120)'),
    o(body('description')).isString().trim().isLength({ max: 1000 }),
    o(body('category')).isIn(CATEGORIES).withMessage('Invalid category'),
    o(body('difficulty')).isIn(DIFFICULTIES).withMessage('Invalid difficulty'),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid due date'),
  ];
};

const r = Router();
r.use(requireAuth); // every quest route is authenticated; every query is scoped to req.user
r.get('/', wrap(c.listQuests));
r.post('/', fields(false), validate, wrap(c.createQuest));
r.get('/:id', id, validate, wrap(c.getQuest));
r.patch('/:id', id, fields(true), validate, wrap(c.updateQuest));
r.delete('/:id', id, validate, wrap(c.deleteQuest));
r.post('/:id/complete', id, validate, wrap(c.complete));
export default r;
