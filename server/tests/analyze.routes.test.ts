import request from 'supertest';
import express from 'express';
import analyzeRoutes from '../src/routes/analysis.routes';
import analyzeController from '../src/controllers/analyzeController';

jest.mock('../src/controllers/analyzeController');
jest.mock('../src/middlewares/authMiddleware', () => jest.fn((req, res, next) => next()));

const mockController = analyzeController as jest.Mocked<typeof analyzeController>;
const app = express();

app.use(express.json());
app.use('/api/analysis', analyzeRoutes);

describe('analyze.routes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /user → getUserAnalyses', async () => {
    mockController.getUserAnalyses.mockImplementationOnce(async (req, res) => {
      return res.status(200).json({ called: 'getUserAnalyses' });
    });

    const res = await request(app).get('/api/analysis/user');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'getUserAnalyses' });
  });

  it('POST /submit → submitAnalysis', async () => {
    mockController.submitAnalysis.mockImplementationOnce(async (req, res) => {
      return res.status(200).json({ called: 'submitAnalysis' });
    });

    const res = await request(app).post('/api/analysis/submit').send({});
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'submitAnalysis' });
  });

  it('POST /assign → assignAnalysis (with auth)', async () => {
    mockController.assignAnalysis.mockImplementationOnce(async (req, res) => {
      return res.status(200).json({ called: 'assignAnalysis' });
    });

    const res = await request(app).post('/api/analysis/assign').send({});
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'assignAnalysis' });
  });

  it('GET / → getAllAnalyses', async () => {
    mockController.getAllAnalyses.mockImplementationOnce(async (req, res) => {
      res.status(200).json({ called: 'getAllAnalyses' });
    });

    const res = await request(app).get('/api/analysis');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'getAllAnalyses' });
  });

  it('POST /detailed-results → getDetailedResults', async () => {
    mockController.getDetailedResults.mockImplementationOnce(async (req, res) => {
      return res.status(200).json({ called: 'getDetailedResults' });
    });

    const res = await request(app).post('/api/analysis/detailed-results').send({});
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'getDetailedResults' });
  });

  it('GET /:tableName → getTableData', async () => {
    mockController.getTableData.mockImplementationOnce(async (req, res) => {
      res.status(200).json({ called: 'getTableData', param: req.params.tableName });
    });

    const res = await request(app).get('/api/analysis/biochemistry');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'getTableData', param: 'biochemistry' });
  });
});
