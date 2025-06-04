// tests/ResultService.test.ts
import { ResultService } from '../src/services/resultService';
import db from '../src/db';

jest.mock('../src/db');
const mockDb = db as jest.Mocked<typeof db>;

describe('ResultService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserResults', () => {
    it('throws if analysis not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] } as any);

      await expect(
        ResultService.getUserResults('student1', 'badId')
      ).rejects.toThrow('Анализ не найден.');

      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('returns empty results array when no rows', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ analyze_name: 'Test' }] } as any)
        .mockResolvedValueOnce({ rows: [] } as any);

      const res = await ResultService.getUserResults('stu1', 'an1');
      expect(res).toEqual({ results: [] });
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it('groups measurements by parameter with bounds', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ analyze_name: 'Test' }] } as any)
        .mockResolvedValueOnce({
          rows: [
            {
              parameter_name: 'Heart Rate',
              value: 70,
              submitted_at: new Date('2025-01-01'),
              lower_bound: 60,
              upper_bound: 100,
            },
            {
              parameter_name: 'Heart Rate',
              value: 75,
              submitted_at: new Date('2025-02-01'),
              lower_bound: 60,
              upper_bound: 100,
            },
            {
              parameter_name: 'Blood Pressure',
              value: '120/80',
              submitted_at: new Date('2025-01-15'),
              lower_bound: null,
              upper_bound: null,
            },
          ],
        } as any);

      // Cast return to any so TS allows .find() result to have our props:
      const { results: rawResults } = (await ResultService.getUserResults('stu1', 'an1')) as any;
      const results: any[] = rawResults;

      expect(results).toHaveLength(2);

      // annotate r as any to silence TS
      const hr: any = results.find((r: any) => r.parameter === 'Heart Rate');
      expect(hr.lowerBound).toBe(60);
      expect(hr.upperBound).toBe(100);
      expect(hr.measurements).toEqual([
        { value: 70, date: new Date('2025-01-01') },
        { value: 75, date: new Date('2025-02-01') },
      ]);

      const bp: any = results.find((r: any) => r.parameter === 'Blood Pressure');
      expect(bp.lowerBound).toBeNull();
      expect(bp.upperBound).toBeNull();
      expect(bp.measurements).toEqual([
        { value: '120/80', date: new Date('2025-01-15') },
      ]);

      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });
  });
});
