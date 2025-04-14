import { Request, Response } from 'express';
import teamController from '../src/controllers/teamController';
import { TeamService } from '../src/services/teamService';

jest.mock('../src/services/teamService');
const mockService = TeamService as jest.Mocked<typeof TeamService>;

const mockRes = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('TeamController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTeam', () => {
    it('should return 400 if missing fields', async () => {
      const req = { body: {} } as Request;
      const res = mockRes();

      await teamController.createTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Название и вид спорта обязательны' });
    });

    it('should create team and return 201', async () => {
      const req = {
        body: { sport_id: 's1', team_name: 'Alpha' },
      } as Request;
      const res = mockRes();

      const team = { team_id: 't1', sport_id: 's1', team_name: 'Alpha' };
      mockService.createTeam.mockResolvedValue(team);

      await teamController.createTeam(req, res);

      expect(mockService.createTeam).toHaveBeenCalledWith('Alpha', 's1');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(team);
    });

    it('should return 500 on error', async () => {
      const req = {
        body: { sport_id: 's1', team_name: 'Alpha' },
      } as Request;
      const res = mockRes();

      mockService.createTeam.mockRejectedValue(new Error('DB error'));

      await teamController.createTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB error' });
    });
  });

  describe('getTeamsBySport', () => {
    it('should return 400 if sport_id missing', async () => {
      const req = { query: {} } as unknown as Request;
      const res = mockRes();

      await teamController.getTeamsBySport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Sport ID is required' });
    });

    it('should return teams', async () => {
      const req = { query: { sport_id: 's1' } } as unknown as Request;
      const res = mockRes();

      const teams = [{ team_id: '1', team_name: 'Alpha', sport_id: 's1' }];

      mockService.getTeamsBySport.mockResolvedValue(teams);

      await teamController.getTeamsBySport(req, res);

      expect(mockService.getTeamsBySport).toHaveBeenCalledWith('s1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(teams);
    });

    it('should return 500 on error', async () => {
      const req = { query: { sport_id: 's1' } } as unknown as Request;
      const res = mockRes();

      mockService.getTeamsBySport.mockRejectedValue(new Error('Internal'));

      await teamController.getTeamsBySport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
});
