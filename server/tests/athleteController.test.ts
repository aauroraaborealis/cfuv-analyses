import { Request, Response } from 'express';
import athleteController from '../src/controllers/athleteController';
import { AthleteService } from '../src/services/athleteService';

jest.mock('../src/services/athleteService');
const mockService = AthleteService as jest.Mocked<typeof AthleteService>;

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('athleteController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStudentsByTeam', () => {
    it('should return 200 and students by team', async () => {
      const req = { query: { team_id: 't1' } } as unknown as Request;
      const res = mockResponse();

      const students = [{ id: 1 }, { id: 2 }];
      mockService.getStudentsByTeam.mockResolvedValue(students as any);

      await athleteController.getStudentsByTeam(req, res);

      expect(mockService.getStudentsByTeam).toHaveBeenCalledWith('t1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(students);
    });

    it('should return 500 if service throws', async () => {
      const req = { query: { team_id: 't1' } } as unknown as Request;
      const res = mockResponse();

      mockService.getStudentsByTeam.mockRejectedValue(new Error('DB error'));

      await athleteController.getStudentsByTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error.' });
    });
  });

  describe('getStudentsBySport', () => {
    it('should return 200 and students by sport', async () => {
      const req = { query: { sport_id: 's1' } } as unknown as Request;
      const res = mockResponse();

      const students = [{ id: 1 }, { id: 2 }];
      mockService.getStudentsBySport.mockResolvedValue(students as any);

      await athleteController.getStudentsBySport(req, res);

      expect(mockService.getStudentsBySport).toHaveBeenCalledWith('s1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(students);
    });

    it('should return 400 if sport_id is missing', async () => {
      const req = { query: {} } as Request;
      const res = mockResponse();

      await athleteController.getStudentsBySport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Sport ID is required.' });
    });

    it('should return 500 if service throws', async () => {
      const req = { query: { sport_id: 's1' } } as unknown as Request;
      const res = mockResponse();

      mockService.getStudentsBySport.mockRejectedValue(new Error('Unexpected error'));

      await athleteController.getStudentsBySport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unexpected error' });
    });
  });
});
