import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Расширяем интерфейс Request
declare module "express-serve-static-core" {
  interface Request {
    user?: { trainer_id: string };
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  console.log(req.headers);
  console.log(authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Не авторизован" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET не задан в .env");
      return res.status(500).json({ message: "Ошибка сервера" });
    }

    // Декодируем токен и явно указываем тип
    const decoded = jwt.verify(token, secret) as JwtPayload;
    console.log(decoded);

    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      return res.status(403).json({ message: "Недействительный токен" });
    }

    req.user = { trainer_id: decoded.id }; // Добавляем trainer_id в req.user
    next();
  } catch (error) {
    console.error("Ошибка верификации токена:", error);
    return res.status(403).json({ message: "Недействительный токен" });
  }
};

export default authMiddleware;
