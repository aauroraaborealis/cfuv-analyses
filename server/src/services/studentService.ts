// import db from '../db';

// export class StudentService {
//   static async getStudentsByTeam(team_id?: string) {
//     let query = `
//       SELECT 
//         student_id, 
//         first_name, 
//         last_name, 
//         email, 
//         team_id 
//       FROM students
//     `;
//     const values: any[] = [];

//     if (team_id) {
//       query += ` WHERE team_id = $1`;
//       values.push(team_id);
//     }

//     const result = await db.query(query, values);
//     console.log(result.rows);
//     return result.rows;
//   }

//   static async getStudentsBySport(sport_id: string) {
//     const query = `
//       SELECT student_id, first_name, last_name, team_id, sport_id
//       FROM students
//       WHERE sport_id = $1
//     `;
//     const result = await db.query(query, [sport_id]);

//     if (result.rowCount === 0) throw new Error('No students found for this sport.');

//     console.log(result.rows);

//     return result.rows;
//   }
// }


import db from '../db';

export interface Student {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  sport_name: string;
  team_name: string | null;
}

export class StudentService {
  
  /**
   * Получить список студентов, при необходимости фильтруя по команде
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
   * Получить список студентов по определённому спорту
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
