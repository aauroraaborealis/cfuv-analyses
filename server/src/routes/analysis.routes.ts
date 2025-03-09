import { Router } from 'express';
import analyzeController from '../controllers/analyzeController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

router.get('/user', analyzeController.getUserAnalyses);
router.post('/submit', analyzeController.submitAnalysis);
router.post('/assign', authMiddleware, analyzeController.assignAnalysis);
router.get("/", analyzeController.getAllAnalyses);
router.post('/detailed-results', analyzeController.getDetailedResults);
router.get("/assignments", analyzeController.getAllAssignments);
router.get("/assignment/:assignment_id", analyzeController.getAssignmentById);
router.put("/assignment/:assignment_id", analyzeController.updateAssignment);
router.delete("/assignment/:assignment_id", analyzeController.deleteAssignment);
router.get("/:tableName", analyzeController.getTableData);

export default router;
