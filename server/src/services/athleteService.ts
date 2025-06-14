import db from '../db';

export interface Student {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  sport_name: string;
  team_name: string | null;
}

export class AthleteService {
  
  /**
   * Получить список спортсменов, при необходимости фильтруя по команде
   */
  static async getStudentsByTeam(team_id?: string): Promise<Student[]> {
    // Базовый запрос с JOIN-ами для получения названий спорта и команды
    let query = `
      SELECT
        s.student_id,
        s.last_name,
        s.first_name,
        s.middle_name,
        sp.sport_name,
        t.team_name
      FROM students s
      LEFT JOIN sports sp ON s.sport_id = sp.sport_id
      LEFT JOIN teams t ON s.team_id = t.team_id
    `;
    const values: any[] = [];

    if (team_id) {
      query += ` WHERE s.team_id = $1`;
      values.push(team_id);
    }

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Получить список спортсменов по определённому спорту
   */
  static async getStudentsBySport(sport_id: string): Promise<Student[]> {
    const query = `
      SELECT
        s.student_id,
        s.last_name,
        s.first_name,
        s.middle_name,
        sp.sport_name,
        t.team_name
      FROM students s
      LEFT JOIN sports sp ON s.sport_id = sp.sport_id
      LEFT JOIN teams t ON s.team_id = t.team_id
      WHERE s.sport_id = $1
    `;
    const result = await db.query(query, [sport_id]);

    if (result.rowCount === 0) {
      throw new Error('No students found for this sport.');
    }

    return result.rows;
  }
}
