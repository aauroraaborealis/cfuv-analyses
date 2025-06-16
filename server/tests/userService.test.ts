import { userService } from '../src/services/userService';
import db from '../src/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { VerificationService } from '../src/services/verificationService';

jest.mock('../src/db');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../src/services/verificationService');

const mockDb = db as unknown as { query: jest.Mock };
const hash = bcrypt.hash as unknown as jest.Mock;
const compare = bcrypt.compare as unknown as jest.Mock;
const sign = jwt.sign as unknown as jest.Mock;
const verify = jwt.verify as unknown as jest.Mock;
const mockVerification = VerificationService as unknown as {
  sendCode: jest.Mock;
  verifyCode: jest.Mock;
  delete: jest.Mock;
};

describe('userService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('registerInit', () => {
    it('should send code for registration', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 0 });
      hash.mockResolvedValue('hashed');

      await userService.registerInit('student', {
        email: 'user@mail.com',
        password: 'password123',
      });

      expect(mockVerification.sendCode).toHaveBeenCalledWith('user@mail.com', expect.any(Object));
    });
  });

  describe('registerVerify', () => {
    it('should verify and insert student, return tokens', async () => {
      mockVerification.verifyCode.mockResolvedValue({
        role: 'student',
        email: 'student@mail.com',
        password: 'hashed',
        first_name: 'John',
        last_name: 'Doe',
        birth_date: '2000-01-01',
        gender: 'male',
        sport_id: 'sport1',
      });
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: 'id1', email: 'student@mail.com', first_name: 'John' }],
      });
      sign.mockReturnValueOnce('access').mockReturnValueOnce('refresh');

      const result = await userService.registerVerify('student', 'student@mail.com', '123456');
      expect(result).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
    });
  });

  describe('loginInit', () => {
    it('should verify credentials and send code', async () => {
      mockDb.query
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [
            {
              id: 'id1',
              email: 'user@mail.com',
              first_name: 'John',
              password_hash: 'hashed',
              role: 'student',
            },
          ],
        });
      compare.mockResolvedValue(true);

      await userService.loginInit('user@mail.com', '123456');
      expect(mockVerification.sendCode).toHaveBeenCalledWith('user@mail.com', expect.any(Object));
    });
  });

  describe('loginVerify', () => {
    it('should return access and refresh tokens after verification', async () => {
      mockVerification.verifyCode.mockResolvedValue({
        id: 'id1',
        email: 'user@mail.com',
        first_name: 'John',
        role: 'trainer',
      });
      sign.mockReturnValueOnce('access').mockReturnValueOnce('refresh');

      const result = await userService.loginVerify('user@mail.com', '123456');
      expect(result).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
    });
  });

  describe('refreshToken', () => {
    it('should generate a new access token from a valid refresh token', async () => {
      verify.mockReturnValue({
        id: 'id1',
        email: 'user@mail.com',
        first_name: 'John',
        role: 'trainer',
      });
      sign.mockReturnValue('new-access');

      const result = await userService.refreshToken('valid-refresh');
      expect(result).toEqual({ accessToken: 'new-access' });
    });

    it('should throw on missing refresh token', async () => {
      await expect(userService.refreshToken('')).rejects.toThrow('Refresh token required.');
    });

    it('should throw on invalid refresh token', async () => {
      verify.mockImplementation(() => {
        throw new Error('Invalid');
      });

      await expect(userService.refreshToken('invalid')).rejects.toThrow('Invalid refresh token');
    });
  });
});