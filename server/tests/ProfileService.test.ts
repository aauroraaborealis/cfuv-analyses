import { ProfileService } from '../src/services/profileService';
import db from '../src/db';
import bcrypt from 'bcrypt';

jest.mock('../src/db');
jest.mock('bcrypt');

const mockDb = db as unknown as { query: jest.Mock };
const mockHash = bcrypt.hash as unknown as jest.Mock;

describe('ProfileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should return student profile', async () => {
      const mockUser = { role: 'student', student_id: 's1' };
      const mockRow = { student_id: 's1', first_name: 'John', birth_date: '2000-01-01' };

      mockDb.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await ProfileService.getUserProfile(mockUser);
      expect(result).toHaveProperty('first_name', 'John');
      expect(result).toHaveProperty('birth_date', '01.01.2000');
    });

    it('should return trainer profile', async () => {
      const mockUser = { role: 'trainer', trainer_id: 't1' };
      const mockRow = { trainer_id: 't1', first_name: 'Jane' };

      mockDb.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await ProfileService.getUserProfile(mockUser);
      expect(result).toHaveProperty('first_name', 'Jane');
    });

    it('should throw on missing ID', async () => {
      await expect(ProfileService.getUserProfile({ role: 'student' })).rejects.toThrow();
    });

    it('should throw if user not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(ProfileService.getUserProfile({ role: 'trainer', trainer_id: 'no' })).rejects.toThrow('Пользователь не найден');
    });
  });

  describe('updateUserProfile', () => {
    it('should update student profile', async () => {
      const mockUser = { role: 'student', student_id: 's1' };
      const updatedRow = { student_id: 's1', first_name: 'Updated', birth_date: '2000-01-01' };

      mockDb.query.mockResolvedValueOnce({ rows: [updatedRow] });

      const result = await ProfileService.updateUserProfile(mockUser, {
        first_name: 'Updated',
        last_name: 'Doe',
        email: 'updated@mail.com',
        birth_date: '2000-01-01',
        gender: 'male',
        role: 'student',
      });

      expect(result).toHaveProperty('first_name', 'Updated');
    });

    it('should update trainer profile with password', async () => {
      const mockUser = { role: 'trainer', trainer_id: 't1' };
      const updatedRow = { trainer_id: 't1', first_name: 'Updated' };

      mockDb.query
        .mockResolvedValueOnce({ rows: [updatedRow] })
        .mockResolvedValueOnce({});

      mockHash.mockResolvedValue('hashedpass');

      const result = await ProfileService.updateUserProfile(mockUser, {
        first_name: 'Updated',
        last_name: 'Smith',
        email: 'trainer@mail.com',
        gender: 'female',
        role: 'trainer',
      }, 'newpass');

      expect(result).toHaveProperty('first_name', 'Updated');
    });

    it('should throw on missing ID', async () => {
        await expect(
            ProfileService.updateUserProfile(
              { role: 'trainer' }, // без trainer_id
              {
                first_name: 'T',
                last_name: 'X',
                email: 'x@mail.com',
                role: 'trainer',
              }
            )
          ).rejects.toThrow('ID тренера не найден');
          
    });
  });
});
