import db from '../db.js';

export class StudentService {
  static async getStudentsByTeam(team_id?: string) {
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
    return result.rows;
  }

  static async getStudentsBySport(sport_id: string) {
    const query = `
      SELECT student_id, first_name, last_name
      FROM students
      WHERE sport_id = $1
    `;
    const result = await db.query(query, [sport_id]);

    if (result.rowCount === 0) throw new Error('No students found for this sport.');

    return result.rows;
  }
}
