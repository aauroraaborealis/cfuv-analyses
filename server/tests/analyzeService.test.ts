// import db from '../src/db';
// import { notifyUser } from '../src/socketServer';
// import * as vocab from '../src/utils/vocabulary';
// import { AnalyzeService } from '../src/services/analyzeService'; // Adjust the path as needed

// jest.mock('../src/db', () => ({
//   query: jest.fn(),
// }));

// jest.mock('../src/socketServer', () => ({
//   notifyUser: jest.fn(),
// }));

// jest.mock('../src/utils/vocabulary', () => ({
//   getTargetTable: jest.fn(),
//   fieldMapping: { param1: 'mapped_param1' },
//   translateFields: jest.fn(),
// }));

// const mockDb = db as jest.Mocked<typeof db>;
// const mockNotifyUser = notifyUser as jest.Mock;
// const mockGetTargetTable = vocab.getTargetTable as jest.Mock;

// // 👉 универсальный хелпер для моков QueryResult
// const mockQueryResult = (rows: any[] = [], rowCount?: number) => ({
//   rows,
//   rowCount: rowCount ?? rows.length,
//   command: 'SELECT',
//   oid: 0,
//   fields: [],
// });

// describe('AnalyzeService', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('getUserAnalyses returns merged analyses with submission status', async () => {
//     mockDb.query
//       .mockResolvedValueOnce(mockQueryResult([
//         { assignment_id: 1, analyze_id: 2, analyze_name: 'Test', assigned_to_team: false }
//       ])) // userAnalyses
//       .mockResolvedValueOnce(mockQueryResult([])) // teamAnalyses
//       .mockResolvedValueOnce(mockQueryResult([], 1)); // resultCheck with rowCount = 1

//     const result = await AnalyzeService.getUserAnalyses('student-id');
//     expect(result[0]).toHaveProperty('is_submitted', 1);
//   });

//   it('submitAnalysis throws if no assignment', async () => {
//     mockDb.query.mockResolvedValueOnce(mockQueryResult([], 0));
//     await expect(
//       AnalyzeService.submitAnalysis('student', 'assignment', {})
//     ).rejects.toThrow('Assignment not found.');
//   });

//   it('getAllAnalyses returns rows', async () => {
//     mockDb.query.mockResolvedValueOnce(mockQueryResult([{ id: 1 }]));
//     const result = await AnalyzeService.getAllAnalyses();
//     expect(result).toEqual([{ id: 1 }]);
//   });

//   it('assignAnalysis calls notifyUser for student', async () => {
//     mockDb.query
//       .mockResolvedValueOnce(mockQueryResult([], 1)) // analyze check
//       .mockResolvedValueOnce(mockQueryResult([], 1)) // sport check
//       .mockResolvedValueOnce(mockQueryResult([], 1)) // student check
//       .mockResolvedValueOnce(mockQueryResult([{ assignment_id: '123' }])) // insert assignment
//       .mockResolvedValueOnce(mockQueryResult([{ analyze_name: 'Test' }])); // get name

//     const result = await AnalyzeService.assignAnalysis(
//       'analyze',
//       'sport',
//       null,
//       'student',
//       '2024-01-01',
//       'creator'
//     );

//     expect(result).toBe('123');
//     expect(mockNotifyUser).toHaveBeenCalled();
//   });

//   it('getTableData throws if no parameters', async () => {
//     mockDb.query.mockResolvedValueOnce(mockQueryResult([], 0));
//     await expect(AnalyzeService.getTableData('id')).rejects.toThrow(
//       'No parameters found for this analyze ID.'
//     );
//   });

//   it('getDetailedResults throws if no results', async () => {
//     mockDb.query
//       .mockResolvedValueOnce(mockQueryResult([
//         { parameter_id: '1', parameter_name: 'p', unit: 'u' }
//       ], 1)) // parameters
//       .mockResolvedValueOnce(mockQueryResult([], 0)); // results

//     await expect(AnalyzeService.getDetailedResults('aid', 'aid')).rejects.toThrow(
//       'No results found for this assignment ID and analyze type.'
//     );
//   });
// });

import { AnalyzeService } from '../src/services/analyzeService';
import db from '../src/db';
import { notifyUser } from '../src/socketServer';

jest.mock('../src/db');
jest.mock('../src/socketServer');
jest.mock('../src/utils/vocabulary', () => ({
  getTargetTable: jest.fn().mockReturnValue('mock_table'),
  fieldMapping: { Pulse: 'pulse' },
  translateFields: jest.fn()
}));

const mockDb = db as unknown as { query: jest.Mock };
const mockNotify = notifyUser as jest.Mock;

const mockQueryResult = <T>(rows: T[] = [], rowCount = rows.length): any => ({
  rowCount,
  rows,
  command: 'SELECT',
  oid: 0,
  fields: [],
});

describe('AnalyzeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserAnalyses', () => {
    it('should return combined user and team analyses with submission status', async () => {
      mockDb.query
        .mockResolvedValueOnce(mockQueryResult([{ assignment_id: '1', analyze_id: 'a1', analyze_name: 'Test', assigned_to_team: false }]))
        .mockResolvedValueOnce(mockQueryResult([{ assignment_id: '2', analyze_id: 'a2', analyze_name: 'Test2', assigned_to_team: true }]))
        .mockResolvedValueOnce(mockQueryResult([{ exists: true }]))
        .mockResolvedValueOnce(mockQueryResult([]));

      const result = await AnalyzeService.getUserAnalyses('student1');

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('is_submitted');
    });
  });

  describe('getAllAnalyses', () => {
    it('should return all analyses', async () => {
      const analyses = [{ analyze_id: 'a1', analyze_name: 'Test' }];
      mockDb.query.mockResolvedValueOnce(mockQueryResult(analyses));

      const result = await AnalyzeService.getAllAnalyses();
      expect(result).toEqual(analyses);
    });
  });

  describe('assignAnalysis', () => {
    it('should assign and notify student', async () => {
      mockDb.query
        .mockResolvedValueOnce(mockQueryResult([{ analyze_id: 'a1' }])) // analyzeCheck
        .mockResolvedValueOnce(mockQueryResult([{ sport_id: 's1' }])) // sportCheck
        .mockResolvedValueOnce(mockQueryResult([{ student_id: 'st1' }])) // studentCheck
        .mockResolvedValueOnce(mockQueryResult([{ assignment_id: 'as1' }])) // insert
        .mockResolvedValueOnce(mockQueryResult([{ analyze_name: 'Heart Rate' }])) // analyze name

      const result = await AnalyzeService.assignAnalysis('a1', 's1', null, 'st1', '2024-01-01', 'admin');

      expect(result).toBe('as1');
      expect(mockNotify).toHaveBeenCalled();
    });
  });

  describe('submitAnalysis', () => {
    it('should submit analyze results', async () => {
      mockDb.query
        .mockResolvedValueOnce(mockQueryResult([{ analyze_id: 'a1' }])) // assignmentCheck
        .mockResolvedValueOnce(mockQueryResult([{ analyze_name: 'Cardio' }])) // analyzeType
        .mockResolvedValueOnce(mockQueryResult([{ parameter_id: 'p1', unit: 'bpm' }])) // param
        .mockResolvedValueOnce(mockQueryResult([{ lower_bound: 60, upper_bound: 100 }])) // ref
        .mockResolvedValueOnce(mockQueryResult([{ inserted: true }])) // insert results

      const result = await AnalyzeService.submitAnalysis('st1', 'as1', { Pulse: 80 });

      expect(result).toBeDefined();
    });
  });

  describe('getDetailedResults', () => {
    it('should return detailed results with parameter names and units', async () => {
      mockDb.query
        .mockResolvedValueOnce(mockQueryResult([{ parameter_id: 'p1', parameter_name: 'Pulse', unit: 'bpm' }]))
        .mockResolvedValueOnce(mockQueryResult([{ parameter_id: 'p1', value: 80, is_normal: true, created_at: new Date() }]))

      const result = await AnalyzeService.getDetailedResults('as1', 'a1');

      expect(result[0]).toHaveProperty('parameter_name');
    });
  });

  describe('getTableData', () => {
    it('should return aggregated table data', async () => {
      mockDb.query
        .mockResolvedValueOnce(mockQueryResult([{ parameter_id: 'p1', parameter_name: 'Pulse', unit: 'bpm' }]))
        .mockResolvedValueOnce(mockQueryResult([{ parameter_id: 'p1', parameter_name: 'Pulse', lower_bound: 60, upper_bound: 100, gender: 'M', unit: 'bpm' }]))
        .mockResolvedValueOnce(
          mockQueryResult([
            {
              parameter_id: 'p1',
              value: 80,
              is_normal: true,
              created_at: new Date(),
              first_name: 'John',
              last_name: 'Doe',
              middle_name: 'Q',
              sport_name: 'Football',
              team_name: 'A-Team',
              assignment_id: 'as1',
            },
          ])
        );

      const result = await AnalyzeService.getTableData('a1');

      expect(result.length).toBeGreaterThan(1);
      expect(result[0]).toHaveProperty('Нормы');
      expect(result[1]).toBeDefined();
      expect(result[1]['Pulse']).toBeDefined();
    });
  });
});
