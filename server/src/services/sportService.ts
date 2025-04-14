import db from '../db';

interface Sport {
  sport_id: string;
  sport_name: string;
}

export class SportService {
  static async createSport(sport_name: string): Promise<Sport> {
    // Проверяем, существует ли уже такой спорт
    const sportCheck = await db.query(
      'SELECT sport_id FROM sports WHERE sport_name = $1',
      [sport_name]
    );

    if (sportCheck.rowCount !== null && sportCheck.rowCount > 0) {
      throw new Error('Sport already exists');
    }

    // Создаем новый вид спорта
    const query = `
      INSERT INTO sports (sport_id, sport_name)
      VALUES (uuid_generate_v4(), $1)
      RETURNING sport_id, sport_name;
    `;
    const result = await db.query(query, [sport_name]);

    return result.rows[0];
  }

  static async getAllSports(): Promise<Sport[]> {
    const result = await db.query('SELECT sport_id, sport_name FROM sports');
    return result.rows;
  }
}
