import { Router, Request, Response } from 'express';
import db from '../db.js';

const router = Router();

router.post('/create', async (req: Request, res: Response) => {
  const { sport_name } = req.body;

  if (!sport_name) {
    return res.status(400).json({ message: 'Sport name is required.' });
  }

  try {
    const sportCheck = await db.query(
      'SELECT sport_id FROM sports WHERE sport_name = $1',
      [sport_name]
    );
    if (sportCheck.rowCount !== null && sportCheck.rowCount > 0) {
      return res.status(409).json({ message: 'Sport already exists.' });
    }

    const query = `
      INSERT INTO sports (sport_id, sport_name)
      VALUES (uuid_generate_v4(), $1)
      RETURNING sport_id, sport_name;
    `;
    const result = await db.query(query, [sport_name]);

    res.status(201).json({
      sport_id: result.rows[0].sport_id,
      sport_name: result.rows[0].sport_name,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'An error occurred while creating the sport.' });
  }
});

router.get('/list', async (req: Request, res: Response) => {
  try {
    const result = await db.query('SELECT sport_id, sport_name FROM sports');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'An error occurred while fetching sports.' });
  }
});

export default router;
