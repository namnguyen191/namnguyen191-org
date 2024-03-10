import { delay } from '@namnguyen191/utils';
import { Request, RequestHandler } from 'express';
import { expressjwt } from 'express-jwt';
import jwt from 'jsonwebtoken';

import { getUser, getUserByEmail, User } from './db/users.js';

const secret = Buffer.from('Zn8Q5tyZ/G1MHltc4F/gTkVJMlrbKiZt', 'base64');

export const authMiddleware = expressjwt({
  algorithms: ['HS256'],
  credentialsRequired: false,
  secret,
});

export const handleLogin: RequestHandler<
  object,
  { token: string },
  { email: string; password: string }
> = async (req, res) => {
  await delay(2000);
  const { email, password } = req.body;
  const user = await getUserByEmail(email);
  if (!user || user.password !== password) {
    res.sendStatus(401);
  } else {
    const claims = { sub: user.id, email: user.email };
    const token = jwt.sign(claims, secret);
    res.json({ token });
  }
};

export const getUserFromRequest = async (req: Request): Promise<User | null> => {
  if (!req.auth) {
    return null;
  }
  const user = await getUser(req.auth.sub);
  return user ?? null;
};
