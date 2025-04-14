import authMiddleware from '../src/middlewares/authMiddleware';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');
const mockJwt = jwt as jest.Mocked<typeof jwt>;
const verify = jwt.verify as unknown as jest.Mock<any, any>;


describe('authMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 401 if no auth header', () => {
    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Не авторизован' });
  });

  it('should return 401 if auth header is not Bearer', () => {
    req.headers = { authorization: 'Token abc' };

    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Не авторизован' });
  });

  it('should return 500 if secret is missing', () => {
    process.env.ACCESS_SECRET = ''; // simulate missing secret
    req.headers = { authorization: 'Bearer token' };

    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Ошибка сервера' });
  });

  it('should return 403 if jwt is invalid', () => {
    process.env.ACCESS_SECRET = 'test';
    req.headers = { authorization: 'Bearer token' };
    verify.mockImplementation(() => {
      throw new Error('invalid');
    });

    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Недействительный токен' });
  });

  it('should return 403 if decoded is missing id or role', () => {
    process.env.ACCESS_SECRET = 'test';
    req.headers = { authorization: 'Bearer token' };
    verify.mockReturnValue({} as any);

    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Недействительный токен' });
  });

  it('should return 403 if role is unknown', () => {
    process.env.ACCESS_SECRET = 'test';
    req.headers = { authorization: 'Bearer token' };
    verify.mockReturnValue({ id: '123', role: 'alien' });

    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Неизвестный тип пользователя' });
  });

  it('should call next and attach student info', () => {
    process.env.ACCESS_SECRET = 'test';
    req.headers = { authorization: 'Bearer token' };
    verify.mockReturnValue({ id: '123', role: 'student' });

    authMiddleware(req as Request, res as Response, next);

    expect(req.user).toEqual({ student_id: '123', role: 'student' });
    expect(next).toHaveBeenCalled();
  });

  it('should call next and attach trainer info', () => {
    process.env.ACCESS_SECRET = 'test';
    req.headers = { authorization: 'Bearer token' };
    verify.mockReturnValue({ id: '456', role: 'trainer' });

    authMiddleware(req as Request, res as Response, next);

    expect(req.user).toEqual({ trainer_id: '456', role: 'trainer' });
    expect(next).toHaveBeenCalled();
  });
});
