import { Router } from 'express';
import assignmentController from '../controllers/assignmentController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.get("/", authMiddleware, assignmentController.getAllAssignments);
router.get("/:assignment_id", authMiddleware, assignmentController.getAssignmentById);
router.put("/:assignment_id", authMiddleware, assignmentController.updateAssignment);
router.delete("/:assignment_id", authMiddleware, assignmentController.deleteAssignment);

export default router;
