import request from 'supertest';
import express from 'express';
import assignmentRoutes from '../src/routes/assignment.routes';
import assignmentController from '../src/controllers/assignmentController';

jest.mock('../src/controllers/assignmentController');
jest.mock('../src/middlewares/authMiddleware', () => jest.fn((req, res, next) => next()));

const mockController = assignmentController as jest.Mocked<typeof assignmentController>;
const app = express();

app.use(express.json());
app.use('/api/assignment', assignmentRoutes);

describe('assignment.routes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET / → getAllAssignments', async () => {
    mockController.getAllAssignments.mockImplementationOnce(async (req, res) => {
      res.status(200).json({ called: 'getAllAssignments' });
    });

    const res = await request(app).get('/api/assignment');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'getAllAssignments' });
  });

  it('GET /:assignment_id → getAssignmentById', async () => {
    mockController.getAssignmentById.mockImplementationOnce(async (req, res) => {
      res.status(200).json({ called: 'getAssignmentById', id: req.params.assignment_id });
    });

    const res = await request(app).get('/api/assignment/123');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'getAssignmentById', id: '123' });
  });

  it('PUT /:assignment_id → updateAssignment', async () => {
    mockController.updateAssignment.mockImplementationOnce(async (req, res) => {
      res.status(200).json({ called: 'updateAssignment', id: req.params.assignment_id });
    });

    const res = await request(app).put('/api/assignment/123').send({ key: 'value' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'updateAssignment', id: '123' });
  });

  it('DELETE /:assignment_id → deleteAssignment', async () => {
    mockController.deleteAssignment.mockImplementationOnce(async (req, res) => {
      res.status(200).json({ called: 'deleteAssignment', id: req.params.assignment_id });
    });

    const res = await request(app).delete('/api/assignment/123');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ called: 'deleteAssignment', id: '123' });
  });
});
