import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

const COOKIE = 'refreshToken';
export const cookieOpts = {
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: 'strict', // CSRF mitigation; cookie only sent to /api/auth
  path: '/api/auth',
  maxAge: config.refreshTtlMs,
};

const signAccess = (user) => jwt.sign({ sub: user.id }, config.accessSecret, { expiresIn: config.accessTtl });
const signRefresh = (user) =>
  jwt.sign({ sub: user.id, v: user.tokenVersion }, config.refreshSecret, { expiresIn: Math.floor(config.refreshTtlMs / 1000) });

export function issueSession(res, user, status = 200) {
  res.cookie(COOKIE, signRefresh(user), cookieOpts);
  res.status(status).json({ accessToken: signAccess(user), user });
}

export async function register(req, res) {
  const { username, email, password } = req.body;
  const user = await User.create({ username, email, passwordHash: await User.hashPassword(password) });
  issueSession(res, user, 201);
}

export async function login(req, res) {
  const user = await User.findOne({ email: req.body.email }).select('+passwordHash');
  // Same message for unknown email / bad password to avoid account enumeration.
  if (!user || !(await user.verifyPassword(req.body.password))) throw new AppError(401, 'Invalid email or password');
  issueSession(res, user);
}

export async function refresh(req, res) {
  const token = req.cookies?.[COOKIE];
  if (!token) throw new AppError(401, 'No session');
  let payload;
  try {
    payload = jwt.verify(token, config.refreshSecret);
  } catch {
    throw new AppError(401, 'Session expired');
  }
  const user = await User.findById(payload.sub);
  if (!user || user.tokenVersion !== payload.v) throw new AppError(401, 'Session revoked');
  issueSession(res, user);
}

export async function logout(req, res) {
  const token = req.cookies?.[COOKIE];
  if (token) {
    try {
      const { sub, v } = jwt.verify(token, config.refreshSecret);
      await User.updateOne({ _id: sub, tokenVersion: v }, { $inc: { tokenVersion: 1 } });
    } catch { /* already invalid */ }
  }
  res.clearCookie(COOKIE, { ...cookieOpts, maxAge: undefined });
  res.status(204).end();
}

export const me = (req, res) => res.json({ user: req.user });
