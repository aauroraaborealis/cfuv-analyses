import { Request, Response } from 'express';
import { SportService } from '../services/sportService.js';

class SportController {
  async createSport(req: Request, res: Response) {
    const { sport_name } = req.body;

    if (!sport_name) {
      return res.status(400).json({ message: 'Sport name is required.' });
    }

    try {
      const sport = await SportService.createSport(sport_name);
      res.status(201).json(sport);
    } catch (error: any) {
      console.error('❌ Ошибка создания спорта:', error);
      if (error.message === 'Sport already exists') {
        return res.status(409).json({ message: 'Sport already exists.' });
      }
      res
        .status(500)
        .json({ message: 'An error occurred while creating the sport.' });
    }
  }

  async getAllSports(req: Request, res: Response) {
    try {
      const sports = await SportService.getAllSports();
      res.status(200).json(sports);
    } catch (error) {
      console.error('❌ Ошибка получения списка видов спорта:', error);
      res
        .status(500)
        .json({ message: 'An error occurred while fetching sports.' });
    }
  }
}

export default new SportController();
