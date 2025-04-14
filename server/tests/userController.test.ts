import { Request, Response } from 'express';
import userController from '../src/controllers/userController';
import { userService } from '../src/services/userService';

jest.mock('../src/services/userService');
const mockService = userService as jest.Mocked<typeof userService>;

const mockRes = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.cookie = jest.fn().mockReturnThis();
  res.clearCookie = jest.fn().mockReturnThis();
  return res;
};

describe('userController', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('registerInit', () => {
    it('should return 400 if role is invalid', async () => {
      const req = { body: { role: 'admin' } } as Request;
      const res = mockRes();

      await userController.registerInit(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should call service and return 200', async () => {
      const req = { body: { role: 'student', email: 'test@mail.com' } } as Request;
      const res = mockRes();

      await userController.registerInit(req, res);
      expect(mockService.registerInit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('registerVerify', () => {
    it('should set cookie and return token', async () => {
      const req = {
        body: { email: 'test@mail.com', code: '1234', role: 'student' },
      } as Request;
      const res = mockRes();

      mockService.registerVerify.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
      });

      await userController.registerVerify(req, res);

      expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Registered successfully.', token: 'access' });
    });
  });

  describe('loginInit', () => {
    it('should call loginInit and return 200', async () => {
      const req = { body: { email: 'test@mail.com', password: '123456' } } as Request;
      const res = mockRes();

      await userController.loginInit(req, res);

      expect(mockService.loginInit).toHaveBeenCalledWith('test@mail.com', '123456');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 401 on error', async () => {
      const req = { body: { email: 'test@mail.com', password: 'bad' } } as Request;
      const res = mockRes();
      mockService.loginInit.mockRejectedValueOnce(new Error('User not found.'));

      await userController.loginInit(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('loginVerify', () => {
    it('should set cookie and return access token', async () => {
      const req = { body: { email: 'mail', code: '1234' } } as Request;
      const res = mockRes();
      mockService.loginVerify.mockResolvedValue({ accessToken: 'token', refreshToken: 'ref' });

      await userController.loginVerify(req, res);

      expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'ref', expect.any(Object));
      expect(res.json).toHaveBeenCalledWith({ message: 'Logined successfully.', token: 'token' });
    });
  });

  describe('refresh', () => {
    it('should return new access token', async () => {
        const req = { cookies: { refreshToken: 'refresh' } } as unknown as Request;
      const res = mockRes();

      mockService.refreshToken.mockResolvedValue({ accessToken: 'access' });

      await userController.refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ accessToken: 'access' });
    });

    it('should return 401 if no refreshToken', async () => {
        const req = { cookies: {} } as unknown as Request;

      const res = mockRes();

      await userController.refresh(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('logout', () => {
    it('should clear cookie and return 200', async () => {
      const req = {} as Request;
      const res = mockRes();

      await userController.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out' });
    });
  });
});
