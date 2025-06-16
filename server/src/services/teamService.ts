import db from '../db';

interface Team {
  team_id: string;
  team_name: string;
  sport_id: string;
}

export class TeamService {
  static async createTeam(team_name: string, sport_id: string): Promise<Team> {
    const query = `
      INSERT INTO teams (team_id, team_name, sport_id)
      VALUES (uuid_generate_v4(), $1, $2)
      RETURNING team_id, team_name, sport_id
    `;
    const result = await db.query(query, [team_name, sport_id]);
    return result.rows[0];
  }

  static async getTeamsBySport(sport_id: string): Promise<Team[]> {
    const query = `SELECT team_id, team_name FROM teams WHERE sport_id = $1`;
    const result = await db.query(query, [sport_id]);
    return result.rows;
  }
}
