import { Request, Response } from 'express';
import sportController from '../src/controllers/sportController';
import { SportService } from '../src/services/sportService';

jest.mock('../src/services/sportService');
const mockService = SportService as jest.Mocked<typeof SportService>;

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('SportController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSport', () => {
    it('should return 400 if sport_name is missing', async () => {
      const req = { body: {} } as Request;
      const res = mockResponse();

      await sportController.createSport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Sport name is required.' });
    });

    it('should return 201 if sport is created', async () => {
      const req = { body: { sport_name: 'Tennis' } } as Request;
      const res = mockResponse();

      const mockSport = { sport_id: 'uuid123', sport_name: 'Tennis' };
      mockService.createSport.mockResolvedValue(mockSport);

      await sportController.createSport(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockSport);
    });

    it('should return 409 if sport already exists', async () => {
      const req = { body: { sport_name: 'Football' } } as Request;
      const res = mockResponse();

      mockService.createSport.mockRejectedValue(new Error('Sport already exists'));

      await sportController.createSport(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Sport already exists.' });
    });

    it('should return 500 if unknown error occurs', async () => {
      const req = { body: { sport_name: 'Hockey' } } as Request;
      const res = mockResponse();

      mockService.createSport.mockRejectedValue(new Error('Something broke'));

      await sportController.createSport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'An error occurred while creating the sport.',
      });
    });
  });

  describe('getAllSports', () => {
    it('should return 200 with sports', async () => {
      const req = {} as Request;
      const res = mockResponse();

      const sports = [
        { sport_id: '1', sport_name: 'Football' },
        { sport_id: '2', sport_name: 'Basketball' },
      ];

      mockService.getAllSports.mockResolvedValue(sports);

      await sportController.getAllSports(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(sports);
    });

    it('should return 500 if error occurs', async () => {
      const req = {} as Request;
      const res = mockResponse();

      mockService.getAllSports.mockRejectedValue(new Error('DB error'));

      await sportController.getAllSports(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'An error occurred while fetching sports.',
      });
    });
  });
});
