import { Request, Response } from 'express';
import { AssignmentService } from '../services/assignmentService';

class AssignmentController {
  async getAllAssignments(req: Request, res: Response) {
    try {
      const assignments = await AssignmentService.getAllAssignments();
      res.status(200).json(assignments);
    } catch (error: any) {
      console.error("Ошибка при получении назначенных анализов:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }

  async getAssignmentById(req: Request, res: Response) {
    try {
      const { assignment_id } = req.params;
      const assignment = await AssignmentService.getAssignmentById(assignment_id);
      res.status(200).json(assignment);
    } catch (error: any) {
      console.error("Ошибка получения анализа:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }

  async updateAssignment(req: Request, res: Response) {
    try {
      const { assignment_id } = req.params;
      const updatedAssignment = await AssignmentService.updateAssignment(assignment_id, req.body);
      res.status(200).json({ message: "Анализ успешно обновлён", updatedAssignment });
    } catch (error: any) {
      console.error("Ошибка обновления анализа:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }

  async deleteAssignment(req: Request, res: Response) {
    try {
      const { assignment_id } = req.params;
      await AssignmentService.deleteAssignment(assignment_id);
      res.status(200).json({ message: "Анализ успешно удалён" });
    } catch (error: any) {
      console.error("Ошибка при удалении анализа:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }
}

export default new AssignmentController();
