import { Request, Response } from 'express';
import resultController from '../src/controllers/resultController';
import { ResultService } from '../src/services/resultService';

jest.mock('../src/services/resultService');
const mockService = ResultService as jest.Mocked<typeof ResultService>;

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('ResultController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getUserResults should return 200 and data if user is authorized', async () => {
    const req = {
      params: { analysisId: 'a1' },
      user: { student_id: 's1' },
    } as any as Request;
    const res = mockResponse();

    const mockData = {
        results: [{ result: 123 }],
        labels: { field1: 'Показатель' },
      };
      
    mockService.getUserResults.mockResolvedValue(mockData);

    await resultController.getUserResults(req, res);

    expect(mockService.getUserResults).toHaveBeenCalledWith('s1', 'a1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  it('getUserResults should return 401 if user is not authorized', async () => {
    const req = {
      params: { analysisId: 'a1' },
      user: undefined,
    } as unknown as Request;
    const res = mockResponse();

    await resultController.getUserResults(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Не авторизован' });
  });
});
