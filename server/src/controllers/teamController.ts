import { Request, Response } from 'express';
import { TeamService } from '../services/teamService.js';

class TeamController {
  async createTeam(req: Request, res: Response) {
    const { sport_id, team_name } = req.body;

    if (!sport_id || !team_name) {
      return res.status(400).json({ message: 'Team name and sport are required.' });
    }

    try {
      const team = await TeamService.createTeam(team_name, sport_id);
      res.status(201).json(team);
    } catch (error) {
      console.error('Ошибка создания команды:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getTeamsBySport(req: Request, res: Response) {
    const { sport_id } = req.query;

    if (!sport_id) {
      return res.status(400).json({ message: 'Sport ID is required' });
    }

    try {
      const teams = await TeamService.getTeamsBySport(sport_id as string);
      res.status(200).json(teams);
    } catch (error) {
      console.error('Ошибка получения списка команд:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new TeamController();
