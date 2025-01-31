import { Router, Request, Response } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { team_id } = req.query;

  try {
    let query = `
      SELECT 
        student_id, 
        first_name, 
        last_name, 
        email, 
        team_id 
      FROM students
    `;
    const values: any[] = [];

    if (team_id) {
      query += ` WHERE team_id = $1`;
      values.push(team_id);
    }

    const result = await db.query(query, values);
    console.log(result.rows);

    res.status(200).json({
      message: 'Students retrieved successfully.',
      students: result.rows,
    });
  } catch (error) {
    console.error('Ошибка получения студентов:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/sport', async (req: Request, res: Response) => {
  const { sport_id } = req.query;

  if (!sport_id) {
    return res.status(400).json({ message: 'Sport ID is required.' });
  }

  try {
    const query = `
      SELECT student_id, first_name, last_name
      FROM students
      WHERE sport_id = $1
    `;
    const result = await db.query(query, [sport_id]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: 'No students found for this sport.' });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching students by sport:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
