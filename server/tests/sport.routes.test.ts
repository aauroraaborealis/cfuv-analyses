import request from 'supertest';
import express from 'express';
import sportRoutes from '../src/routes/sport.routes';
import sportController from '../src/controllers/sportController';
import { Request, Response } from 'express';

jest.mock('../src/controllers/sportController');
const mockController = sportController as jest.Mocked<typeof sportController>;

const app = express();
app.use(express.json());
app.use('/api/sport', sportRoutes);

describe('sport.routes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('POST /create → createSport', async () => {
    mockController.createSport.mockImplementationOnce((async (req: Request, res: Response) => {
      res.status(201).json({ called: 'createSport' });
    }) as any);

    const res = await request(app).post('/api/sport/create').send({ sport_name: 'Football' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ called: 'createSport' });
  });

  it('GET /list → getAllSports', async () => {
    mockController.getAllSports.mockImplementationOnce((async (req: Request, res: Response) => {
      res.status(200).json({ called: 'getAllSports' });
    }) as any);

    const res = await request(app).get('/api/sport/list');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'getAllSports' });
  });
});
