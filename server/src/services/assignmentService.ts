import db from '../db';

export class AssignmentService {
  static async getAllAssignments() {
    const query = `
      SELECT 
        aa.assignment_id,
        a.analyze_name,
        aa.scheduled_date,
        aa.assigned_to_team,
        sp.sport_name,
        s.first_name AS student_first_name,
        s.last_name AS student_last_name,
        t.team_name
      FROM analyze_assignments aa
      LEFT JOIN analyzes a ON aa.analyze_id = a.analyze_id
      LEFT JOIN sports sp ON aa.sport_id = sp.sport_id
      LEFT JOIN students s ON aa.student_id = s.student_id
      LEFT JOIN teams t ON aa.team_id = t.team_id
      ORDER BY aa.scheduled_date DESC;
    `;
    const result = await db.query(query);
    return result.rows;
  }

  static async getAssignmentById(assignment_id: string) {
    const query = `
      SELECT 
        aa.assignment_id,
        aa.analyze_id,
        a.analyze_name,
        aa.scheduled_date,
        aa.assigned_to_team,
        aa.team_id,
        aa.student_id,
        t.team_name,
        s.first_name AS student_first_name,
        s.last_name AS student_last_name,
        tr.first_name AS trainer_first_name,
        tr.last_name AS trainer_last_name,
        aa.created_at,
        COALESCE(s.sport_id, t.sport_id) AS sport_id,
        sp.sport_name
      FROM analyze_assignments aa
      LEFT JOIN analyzes a ON aa.analyze_id = a.analyze_id
      LEFT JOIN teams t ON aa.team_id = t.team_id
      LEFT JOIN students s ON aa.student_id = s.student_id
      LEFT JOIN trainers tr ON aa.created_by = tr.trainer_id
      LEFT JOIN sports sp ON sp.sport_id = COALESCE(s.sport_id, t.sport_id)
      WHERE aa.assignment_id = $1;
    `;
    const result = await db.query(query, [assignment_id]);
    if (result.rows.length === 0) throw new Error('Assignment not found.');
    return result.rows[0];
  }

  static async updateAssignment(assignment_id: string, data: any) {
    const { analyze_id, sport_id, due_date, team_id, student_id } = data;

    const checkQuery =
      'SELECT * FROM analyze_assignments WHERE assignment_id = $1';
    const checkResult = await db.query(checkQuery, [assignment_id]);

    if (checkResult.rowCount === 0) throw new Error('Assignment not found.');

    const updateQuery = `
      UPDATE analyze_assignments
      SET analyze_id = $1,
          sport_id = $2,
          scheduled_date = $3,
          team_id = $4,
          student_id = $5,
          assigned_to_team = $6,
          updated_at = NOW()
      WHERE assignment_id = $7
      RETURNING *;
    `;
    const values = [
      analyze_id,
      sport_id,
      due_date,
      team_id || null,
      student_id || null,
      !!team_id,
      assignment_id,
    ];
    const updateResult = await db.query(updateQuery, values);

    return updateResult.rows[0];
  }

  static async deleteAssignment(assignment_id: string) {
    const deleteQuery =
      'DELETE FROM analyze_assignments WHERE assignment_id = $1 RETURNING *;';
    const result = await db.query(deleteQuery, [assignment_id]);

    if (result.rowCount === 0) throw new Error('Assignment not found.');
    return result.rows[0];
  }
}
