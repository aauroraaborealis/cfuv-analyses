import request from 'supertest';
import express from 'express';
import resultRoutes from '../src/routes/stats.routes';
import resultController from '../src/controllers/resultController';
import { Request, Response } from 'express';

jest.mock('../src/controllers/resultController');
jest.mock('../src/middlewares/authMiddleware', () => (req: any, res: any, next: any) => next());

const mockResultController = resultController as jest.Mocked<typeof resultController>;

const app = express();
app.use(express.json());
app.use('/api', resultRoutes);

describe('result.routes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /user/results/:analysisId → getUserResults', async () => {
    mockResultController.getUserResults.mockImplementationOnce((async (req: Request, res: Response) => {
      res.status(200).json({ called: 'getUserResults', param: req.params.analysisId });
    }) as any);

    const res = await request(app)
      .get('/api/user/results/123')
      .set('Authorization', 'Bearer dummy');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'getUserResults', param: '123' });
  });
});
