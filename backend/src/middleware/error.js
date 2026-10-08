import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';
import { config } from '../config/index.js';

export const validate = (req, _res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
  next(Object.assign(new AppError(400, errors[0].message), { errors }));
};

export const notFound = (_req, _res, next) => next(new AppError(404, 'Route not found'));

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  if (err.code === 11000) err = new AppError(409, 'That email is already registered');
  const status = err.status || 500;
  const body = { message: err.isOperational || err.status ? err.message : 'Internal server error' };
  if (err.errors) body.errors = err.errors;
  if (status === 500) {
    console.error(err);
    if (config.env !== 'production') body.stack = err.stack;
  }
  res.status(status).json(body);
};
