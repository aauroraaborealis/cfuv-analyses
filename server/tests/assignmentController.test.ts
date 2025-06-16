import { Request, Response } from 'express';
import assignmentController from '../src/controllers/assignmentController';
import { AssignmentService } from '../src/services/assignmentService';

jest.mock('../src/services/assignmentService');

const mockService = AssignmentService as jest.Mocked<typeof AssignmentService>;

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('assignmentController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getAllAssignments returns 200 with assignments', async () => {
    const req = {} as Request;
    const res = mockResponse();
    const data = [{ id: 1 }, { id: 2 }];
    mockService.getAllAssignments.mockResolvedValue(data);
    await assignmentController.getAllAssignments(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(data);
  });

  it('getAssignmentById returns 200 with assignment', async () => {
    const req = { params: { assignment_id: 'abc' } } as unknown as Request;
    const res = mockResponse();
    const assignment = { id: 'abc', name: 'Assignment 1' };
    mockService.getAssignmentById.mockResolvedValue(assignment);
    await assignmentController.getAssignmentById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(assignment);
  });

  it('updateAssignment returns 200 with message and updatedAssignment', async () => {
    const req = {
      params: { assignment_id: 'abc' },
      body: { field: 'newValue' },
    } as unknown as Request;
    const res = mockResponse();
    const updated = { id: 'abc', field: 'newValue' };
    mockService.updateAssignment.mockResolvedValue(updated);
    await assignmentController.updateAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Анализ успешно обновлён',
      updatedAssignment: updated,
    });
  });

  it('deleteAssignment returns 200 with confirmation', async () => {
    const req = { params: { assignment_id: 'abc' } } as unknown as Request;
    const res = mockResponse();
    mockService.deleteAssignment.mockResolvedValue(undefined);
    await assignmentController.deleteAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Анализ успешно удалён' });
  });
});
