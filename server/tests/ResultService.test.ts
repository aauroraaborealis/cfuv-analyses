import { ResultService } from '../src/services/resultService';
import db from '../src/db';

jest.mock('../src/db');
const mockDb = db as unknown as { query: jest.Mock };

describe('ResultService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserResults', () => {
    it('should return results for given user and analyze ID', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ analysis_table: 'test_table' }] }) // tableQuery
        .mockResolvedValueOnce({ rows: [
          { column_name: 'pulse' },
          { column_name: 'analyze_date' },
          { column_name: 'student_id' },
          { column_name: 'result_id' },
        ] }) // columnsQuery
        .mockResolvedValueOnce({ rows: [
          { pulse: 75, analyze_date: '2024-01-01' },
        ] }); // resultsQuery

      const result = await ResultService.getUserResults('student1', 'analyze1');
      expect(result).toHaveProperty('results');
      expect(result.results.length).toBe(1);
      expect(result.results[0]).toHaveProperty('pulse');
    });

    it('should throw if analysis not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(ResultService.getUserResults('student1', 'badId')).rejects.toThrow('Анализ не найден.');
    });

    it('should throw if no selected columns', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ analysis_table: 'test_table' }] }) // tableQuery
        .mockResolvedValueOnce({ rows: [
          { column_name: 'created_at' },
          { column_name: 'result_id' },
          { column_name: 'assignment_id' },
          { column_name: 'student_id' },
          { column_name: 'analyze_id' },
        ] }); // all excluded

      await expect(ResultService.getUserResults('student1', 'analyze1')).rejects.toThrow('Нет данных для отображения.');
    });
  });
});
