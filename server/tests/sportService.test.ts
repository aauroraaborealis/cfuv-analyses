import { SportService } from '../src/services/sportService';
import db from '../src/db';

jest.mock('../src/db');
const mockDb = db as jest.Mocked<typeof db>;

describe('SportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createSport should throw if sport already exists', async () => {
    mockDb.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [],
      command: 'SELECT',
      oid: 0,
      fields: [],
    });

    await expect(SportService.createSport('Football')).rejects.toThrow('Sport already exists');
  });

  it('createSport should insert and return new sport', async () => {
    mockDb.query
      .mockResolvedValueOnce({
        rowCount: 0,
        rows: [],
        command: 'SELECT',
        oid: 0,
        fields: [],
      }) 
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ sport_id: 'uuid123', sport_name: 'Tennis' }],
        command: 'INSERT',
        oid: 0,
        fields: [],
      }); 

    const result = await SportService.createSport('Tennis');

    expect(result).toEqual({ sport_id: 'uuid123', sport_name: 'Tennis' });
    expect(mockDb.query).toHaveBeenCalledTimes(2);
  });

  it('getAllSports should return all sports', async () => {
    mockDb.query.mockResolvedValueOnce({
      rowCount: 2,
      rows: [
        { sport_id: '1', sport_name: 'Football' },
        { sport_id: '2', sport_name: 'Basketball' },
      ],
      command: 'SELECT',
      oid: 0,
      fields: [],
    });

    const result = await SportService.getAllSports();
    expect(result).toEqual([
      { sport_id: '1', sport_name: 'Football' },
      { sport_id: '2', sport_name: 'Basketball' },
    ]);
  });
});
