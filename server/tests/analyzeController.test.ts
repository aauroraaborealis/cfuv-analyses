import { Request, Response } from 'express';
import analyzeController from '../src/controllers/analyzeController'; // 👈 уже готовый экземпляр
import { AnalyzeService } from '../src/services/analyzeService';
import jwt from 'jsonwebtoken';

jest.mock('../src/services/analyzeService');
jest.mock('jsonwebtoken');

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

const mockVerify = jwt.verify as jest.Mock;
const mockService = AnalyzeService as jest.Mocked<typeof AnalyzeService>;

describe('analyzeController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getUserAnalyses should return 200 with data', async () => {
    const req = {
      headers: { authorization: 'Bearer token' },
    } as unknown as Request;
    const res = mockResponse();

    mockVerify.mockReturnValue({ id: 'user-id' });
    mockService.getUserAnalyses.mockResolvedValue([{ analysis: 1 }]);

    await analyzeController.getUserAnalyses(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ analyses: [{ analysis: 1 }] });
  });

  it('submitAnalysis should return 201 on success', async () => {
    const req = {
      headers: { authorization: 'Bearer token' },
      body: { assignment_id: 'a1', analyze_data: { some: 'data' } },
    } as unknown as Request;
    const res = mockResponse();

    mockVerify.mockReturnValue({ id: 'user-id' });
    mockService.submitAnalysis.mockResolvedValue([{ inserted: true }]);

    await analyzeController.submitAnalysis(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Analysis submitted successfully.',
      result: [{ inserted: true }],
    });
  });

  it('getAllAnalyses should return 200', async () => {
    const req = {} as Request;
    const res = mockResponse();

    mockService.getAllAnalyses.mockResolvedValue([{ a: 1 }]);

    await analyzeController.getAllAnalyses(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ a: 1 }]);
  });

  it('getDetailedResults should return 200 with data', async () => {
    const req = {
      body: { assignment_id: 'a', analyze_id: 'b' },
    } as Request;
    const res = mockResponse();

    mockService.getDetailedResults.mockResolvedValue([{ result: 1 }]);

    await analyzeController.getDetailedResults(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ results: [{ result: 1 }] });
  });

  it('getTableData should return data', async () => {
    const req = {
      params: { tableName: 'abc' },
    } as unknown as Request;
    const res = mockResponse();

    mockService.getTableData.mockResolvedValue([{ val: 123 }]);

    await analyzeController.getTableData(req, res);

    expect(res.json).toHaveBeenCalledWith([{ val: 123 }]);
  });

  it('assignAnalysis should return 201 with assignment_id', async () => {
    const req = {
      body: {
        analyze_id: 'a1',
        sport_id: 's1',
        student_id: 'u1',
        due_date: '2024-01-01',
      },
      user: { trainer_id: 't1' },
    } as any;
    const res = mockResponse();

    mockService.assignAnalysis.mockResolvedValue('assignment-id');

    await analyzeController.assignAnalysis(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Analysis assigned successfully.',
      assignment_id: 'assignment-id',
    });
  });
});
