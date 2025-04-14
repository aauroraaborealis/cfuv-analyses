import request from 'supertest';
import express, { Request, Response } from 'express';
import teamRoutes from '../src/routes/team.routes';
import teamController from '../src/controllers/teamController';

jest.mock('../src/controllers/teamController');
const mockController = teamController as jest.Mocked<typeof teamController>;

const app = express();
app.use(express.json());
app.use('/api/teams', teamRoutes);

describe('team.routes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('POST /create → createTeam', async () => {
    mockController.createTeam.mockImplementationOnce((async (req: Request, res: Response) => {
      res.status(201).json({ called: 'createTeam', body: req.body });
    }) as any);

    const res = await request(app)
      .post('/api/teams/create')
      .send({ team_name: 'Winners', sport_id: 'sport123' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ called: 'createTeam', body: { team_name: 'Winners', sport_id: 'sport123' } });
  });

  it('GET /list → getTeamsBySport', async () => {
    mockController.getTeamsBySport.mockImplementationOnce((async (req: Request, res: Response) => {
      res.status(200).json({ called: 'getTeamsBySport', sport_id: req.query.sport_id });
    }) as any);

    const res = await request(app).get('/api/teams/list?sport_id=sport456');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'getTeamsBySport', sport_id: 'sport456' });
  });
});
