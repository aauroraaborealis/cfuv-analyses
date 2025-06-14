import { AthleteService } from '../src/services/athleteService';
import db from '../src/db';

jest.mock('../src/db');
const mockDb = db as unknown as { query: jest.Mock };

describe('AthleteService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStudentsByTeam', () => {
    it('should return students filtered by team_id', async () => {
      const mockStudents = [
        { student_id: '1', first_name: 'Alice', last_name: 'Smith', email: 'a@mail.com', team_id: 'team1' }
      ];
      mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: mockStudents });

      const result = await AthleteService.getStudentsByTeam('team1');
      expect(result).toEqual(mockStudents);
      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), ['team1']);
    });

    it('should return all students if no team_id is provided', async () => {
      const mockStudents = [
        { student_id: '1', first_name: 'Alice', last_name: 'Smith', email: 'a@mail.com', team_id: 'team1' },
        { student_id: '2', first_name: 'Bob', last_name: 'Johnson', email: 'b@mail.com', team_id: 'team2' }
      ];
      mockDb.query.mockResolvedValueOnce({ rowCount: 2, rows: mockStudents });

      const result = await AthleteService.getStudentsByTeam();
      expect(result).toEqual(mockStudents);
      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), []);
    });
  });

  describe('getStudentsBySport', () => {
    it('should return students for a given sport_id', async () => {
      const mockStudents = [
        { student_id: '3', first_name: 'Charlie', last_name: 'Lee' }
      ];
      mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: mockStudents });

      const result = await AthleteService.getStudentsBySport('sport1');
      expect(result).toEqual(mockStudents);
      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), ['sport1']);
    });

    it('should throw an error if no students found', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      await expect(AthleteService.getStudentsBySport('sportX')).rejects.toThrow(
        'No students found for this sport.'
      );
    });
  });
});
