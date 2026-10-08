import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AppError } from '../utils/AppError.js';
import { User } from '../models/User.js';

// Identity comes ONLY from the verified token, never from client-supplied ids.
export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new AppError(401, 'Authentication required');
    let payload;
    try {
      payload = jwt.verify(token, config.accessSecret);
    } catch {
      throw new AppError(401, 'Invalid or expired token');
    }
    const user = await User.findById(payload.sub);
    if (!user) throw new AppError(401, 'Account no longer exists');
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
