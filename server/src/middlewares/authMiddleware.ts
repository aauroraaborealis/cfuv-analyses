import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { trainer_id?: string; student_id?: string; role?: string };
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.ACCESS_SECRET;
    if (!secret) {
      console.error('❌ Ошибка: JWT_SECRET не задан в .env');
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (
      !decoded ||
      typeof decoded !== 'object' ||
      !decoded.id ||
      !decoded.role
    ) {
      return res.status(403).json({ message: 'Недействительный токен' });
    }

    if (decoded.role === 'trainer') {
      req.user = { trainer_id: decoded.id, role: 'trainer' };
    } else if (decoded.role === 'student') {
      req.user = { student_id: decoded.id, role: 'student' };
    } else {
      return res.status(403).json({ message: 'Неизвестный тип пользователя' });
    }

    next();
  } catch (error) {
    console.error('❌ Ошибка верификации токена:', error);
    return res.status(403).json({ message: 'Недействительный токен' });
  }
};

export default authMiddleware;
