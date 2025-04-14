import { Request, Response } from 'express';
import request from 'supertest';
import express from 'express';
import profileRoutes from '../src/routes/profile.routes';
import profileController from '../src/controllers/profileController';

jest.mock('../src/controllers/profileController');
jest.mock('../src/middlewares/authMiddleware', () => jest.fn((req: Request, res: Response, next: () => void) => next()));

const mockController = profileController as jest.Mocked<typeof profileController>;
const app = express();

app.use(express.json());
app.use('/api/user/profile', profileRoutes);

describe('profile.routes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET / → getProfile', async () => {
    mockController.getProfile.mockImplementationOnce((async (req: Request, res: Response) => {
        res.status(200).json({ called: 'getProfile' });
      }) as any);

    const res = await request(app).get('/api/user/profile');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'getProfile' });
  });

  it('PUT / → updateProfile', async () => {
    mockController.updateProfile.mockImplementationOnce((async (req: Request, res: Response) => {
        res.status(200).json({ called: 'updateProfile' });
      }) as any);

    const res = await request(app).put('/api/user/profile').send({});
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'updateProfile' });
  });
});
