import { AssignmentService } from '../src/services/assignmentService';
import db from '../src/db';

jest.mock('../src/db');
const mockDb = db as unknown as { query: jest.Mock };

describe('AssignmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllAssignments', () => {
    it('should return all assignments', async () => {
      const mockRows = [{ assignment_id: '1' }, { assignment_id: '2' }];
      mockDb.query.mockResolvedValueOnce({ rows: mockRows });

      const result = await AssignmentService.getAllAssignments();
      expect(result).toEqual(mockRows);
      expect(mockDb.query).toHaveBeenCalled();
    });
  });

  describe('getAssignmentById', () => {
    it('should return assignment by id', async () => {
      const mockRow = { assignment_id: '123' };
      mockDb.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await AssignmentService.getAssignmentById('123');
      expect(result).toEqual(mockRow);
    });

    it('should throw if assignment not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(AssignmentService.getAssignmentById('badId')).rejects.toThrow('Assignment not found.');
    });
  });

  describe('updateAssignment', () => {
    it('should update and return assignment', async () => {
      const mockUpdated = { assignment_id: '456' };
      mockDb.query
        .mockResolvedValueOnce({ rowCount: 1 }) // checkQuery
        .mockResolvedValueOnce({ rows: [mockUpdated] });

      const result = await AssignmentService.updateAssignment('456', {
        analyze_id: 'a1',
        sport_id: 's1',
        due_date: '2024-01-01',
        team_id: 't1',
        student_id: null,
      });

      expect(result).toEqual(mockUpdated);
    });

    it('should throw if assignment not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 0 });

      await expect(
        AssignmentService.updateAssignment('999', {
          analyze_id: 'a1',
          sport_id: 's1',
          due_date: '2024-01-01',
          team_id: 't1',
          student_id: null,
        })
      ).rejects.toThrow('Assignment not found.');
    });
  });

  describe('deleteAssignment', () => {
    it('should delete assignment', async () => {
      const mockDeleted = { assignment_id: '789' };
      mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockDeleted] });

      const result = await AssignmentService.deleteAssignment('789');
      expect(result).toEqual(mockDeleted);
    });

    it('should throw if assignment not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 0 });

      await expect(AssignmentService.deleteAssignment('nope')).rejects.toThrow('Assignment not found.');
    });
  });
});
