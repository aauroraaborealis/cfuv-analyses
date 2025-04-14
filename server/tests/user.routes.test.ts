import request from 'supertest';
import express, { Request, Response } from 'express';
import userRoutes from '../src/routes/user.routes';
import userController from '../src/controllers/userController';

jest.mock('../src/controllers/userController');
const mockController = userController as jest.Mocked<typeof userController>;

const app = express();
app.use(express.json());
app.use('/api/user', userRoutes);

describe('user.routes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('POST /register/init → registerInit', async () => {
    mockController.registerInit.mockImplementationOnce((async (req: Request, res: Response) => {
      res.status(200).json({ called: 'registerInit' });
    }) as any);

    const res = await request(app).post('/api/user/register/init').send({ email: 'test@mail.com', password: 'pass', role: 'student' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'registerInit' });
  });

  it('POST /register/verify → registerVerify', async () => {
    mockController.registerVerify.mockImplementationOnce((async (req: Request, res: Response) => {
      res.status(200).json({ called: 'registerVerify' });
    }) as any);

    const res = await request(app).post('/api/user/register/verify').send({ email: 'test@mail.com', code: '1234', role: 'student' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'registerVerify' });
  });

  it('POST /login/init → loginInit', async () => {
    mockController.loginInit.mockImplementationOnce((async (req: Request, res: Response) => {
      res.status(200).json({ called: 'loginInit' });
    }) as any);

    const res = await request(app).post('/api/user/login/init').send({ email: 'test@mail.com', password: 'pass' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'loginInit' });
  });

  it('POST /login/verify → loginVerify', async () => {
    mockController.loginVerify.mockImplementationOnce((async (req: Request, res: Response) => {
      res.status(200).json({ called: 'loginVerify' });
    }) as any);

    const res = await request(app).post('/api/user/login/verify').send({ email: 'test@mail.com', code: '1234' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'loginVerify' });
  });

  it('POST /refresh → refresh', async () => {
    mockController.refresh.mockImplementationOnce((async (req: Request, res: Response) => {
      res.status(200).json({ called: 'refresh' });
    }) as any);

    const res = await request(app).post('/api/user/refresh').set('Cookie', 'refreshToken=fake');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'refresh' });
  });

  it('POST /logout → logout', async () => {
    mockController.logout.mockImplementationOnce((async (req: Request, res: Response) => {
      res.status(200).json({ called: 'logout' });
    }) as any);

    const res = await request(app).post('/api/user/logout');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'logout' });
  });
});
