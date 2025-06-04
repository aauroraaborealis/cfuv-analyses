import db from '../db';
import bcrypt from 'bcrypt';

interface User {
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  birth_date?: string;
  gender?: string;
  role: 'student' | 'trainer';
  team_id?: string;
  in_team?: boolean;
}

export class ProfileService {
  static async getUserProfile(user: any) {
    let userQuery = '';
    let userValues = [];
    let userId;

    if (user.role === 'student') {
      userId = user.student_id;
      if (!userId) throw new Error('ID спортсмена не найден');

      userQuery = `
        SELECT 
          s.student_id, s.first_name, s.middle_name, s.last_name, s.email, 
          s.birth_date, s.gender, 
          t.team_name, t.team_id,
          sp.sport_name, sp.sport_id,
          'student' as role
        FROM students s
        LEFT JOIN teams t ON s.team_id = t.team_id
        LEFT JOIN sports sp ON s.sport_id = sp.sport_id
        WHERE s.student_id = $1;
      `;
      userValues = [userId];
    } else if (user.role === 'trainer') {
      userId = user.trainer_id;
      if (!userId) throw new Error('ID тренера не найден');

      userQuery = `
        SELECT 
          t.trainer_id, t.first_name, t.middle_name, t.last_name, t.email, t.gender,
          'trainer' as role
        FROM trainers t
        WHERE t.trainer_id = $1;
      `;
      userValues = [userId];
    } /* istanbul ignore next */  
    else { /* istanbul ignore next */ 
      throw new Error('Неизвестный тип пользователя');
    }

    const { rows } = await db.query(userQuery, userValues);
    if (rows.length === 0) throw new Error('Пользователь не найден');

    return {
      ...rows[0],
      birth_date: rows[0].birth_date
        ? new Date(rows[0].birth_date).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
        : null,
    };
  }

  static async updateUserProfile(user: any, updatedData: User, password?: string) {
    let updateQuery = '';
    let updateValues = [];
    let userId;

    if (user.role === 'student') {
      userId = user.student_id;
      if (!userId) throw new Error('ID спортсмена не найден');

      updateQuery = `
        UPDATE students 
        SET first_name = $1, middle_name = $2, last_name = $3, email = $4, birth_date = $5, gender = $6, team_id = $7, in_team = $8
        WHERE student_id = $9
        RETURNING *;
      `;
      updateValues = [
        updatedData.first_name,
        updatedData.middle_name,
        updatedData.last_name,
        updatedData.email,
        updatedData.birth_date,
        updatedData.gender,
        updatedData.team_id,
        updatedData.in_team,
        userId,
      ];
    } else if (user.role === 'trainer') {
      userId = user.trainer_id;
      if (!userId) throw new Error('ID тренера не найден');

      updateQuery = `
        UPDATE trainers 
        SET first_name = $1, middle_name = $2, last_name = $3, email = $4, gender = $5
        WHERE trainer_id = $6
        RETURNING *;
      `;
      updateValues = [
        updatedData.first_name,
        updatedData.middle_name,
        updatedData.last_name,
        updatedData.email,
        updatedData.gender,
        userId,
      ];
    } /* istanbul ignore next */ 
    else {
      /* istanbul ignore next */ 
      throw new Error('Нет доступа');
    }

    // Обновление данных пользователя
    const { rows } = await db.query(updateQuery, updateValues);
    const updatedUser = rows[0];

    // Обновление пароля, если передан
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const passwordQuery = `
        UPDATE ${user.role === 'student' ? 'students' : 'trainers'} 
        SET password_hash = $1 WHERE ${user.role === 'student' ? 'student_id' : 'trainer_id'} = $2
      `;
      await db.query(passwordQuery, [hashedPassword, userId]);
    }

    return {
      ...updatedUser,
      birth_date: updatedUser.birth_date
        ? new Date(updatedUser.birth_date).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
        : null,
    };
  }
}
