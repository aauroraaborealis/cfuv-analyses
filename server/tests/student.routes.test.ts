import request from 'supertest';
import express, { Request, Response } from 'express';
import studentRoutes from '../src/routes/students.routes';
import studentController from '../src/controllers/studentController';

jest.mock('../src/controllers/studentController');
const mockController = studentController as jest.Mocked<typeof studentController>;

const app = express();
app.use(express.json());
app.use('/api/students', studentRoutes);

describe('student.routes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/students → getStudentsByTeam', async () => {
    mockController.getStudentsByTeam.mockImplementationOnce((async (req: Request, res: Response) => {
      res.status(200).json({ called: 'getStudentsByTeam', team_id: req.query.team_id });
    }) as any);

    const res = await request(app).get('/api/students?team_id=team123');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'getStudentsByTeam', team_id: 'team123' });
  });

  it('GET /api/students/sport → getStudentsBySport', async () => {
    mockController.getStudentsBySport.mockImplementationOnce((async (req: Request, res: Response) => {
      res.status(200).json({ called: 'getStudentsBySport', sport_id: req.query.sport_id });
    }) as any);

    const res = await request(app).get('/api/students/sport?sport_id=sport456');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'getStudentsBySport', sport_id: 'sport456' });
  });
});
