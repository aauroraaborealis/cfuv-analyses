import { TeamService } from '../src/services/teamService';
import db from '../src/db';

jest.mock('../src/db');
const mockDb = db as jest.Mocked<typeof db>;

describe('TeamService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createTeam should insert and return new team', async () => {
    const mockTeam = {
      team_id: 'uuid-123',
      team_name: 'Team A',
      sport_id: 'sport-1',
    };

    mockDb.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [mockTeam],
      command: 'INSERT',
      oid: 0,
      fields: [],
    });

    const result = await TeamService.createTeam('Team A', 'sport-1');
    expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO teams'), ['Team A', 'sport-1']);
    expect(result).toEqual(mockTeam);
  });

  it('getTeamsBySport should return list of teams', async () => {
    const mockTeams = [
      { team_id: '1', team_name: 'Alpha' },
      { team_id: '2', team_name: 'Beta' },
    ];

    mockDb.query.mockResolvedValueOnce({
      rowCount: 2,
      rows: mockTeams,
      command: 'SELECT',
      oid: 0,
      fields: [],
    });

    const result = await TeamService.getTeamsBySport('sport-99');
    expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('SELECT team_id, team_name FROM teams'), ['sport-99']);
    expect(result).toEqual(mockTeams);
  });
});
