import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import db from '../db.js';
import bcrypt from 'bcrypt';

const router = Router();

// Получение данных профиля
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ message: 'Нет доступа' });
    }

    let userQuery = '';
    let userValues = [];
    let userId;

    if (req.user.role === 'student') {
      userId = req.user.student_id;
      if (!userId)
        return res.status(403).json({ message: 'ID студента не найден' });

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
    } else if (req.user.role === 'trainer') {
      userId = req.user.trainer_id;
      if (!userId)
        return res.status(403).json({ message: 'ID тренера не найден' });

      userQuery = `
          SELECT 
            t.trainer_id, t.first_name, t.middle_name, t.last_name, t.email, t.gender,
            'trainer' as role
          FROM trainers t
          WHERE t.trainer_id = $1;
        `;
      userValues = [userId];
    } else {
      return res.status(403).json({ message: 'Неизвестный тип пользователя' });
    }

    const { rows } = await db.query(userQuery, userValues);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const user = rows[0];

    // ❗ Исправляем баг с датой
    const fixedUser = {
      ...user,
      birth_date: new Date(user.birth_date).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
    };

    res.json({ user: fixedUser });

    console.log(fixedUser);
  } catch (err) {
    console.error('❌ Ошибка получения профиля:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление данных пользователя
router.put('/', authMiddleware, async (req, res) => {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      email,
      birth_date,
      gender,
      password,
      team_id,
      in_team,
    } = req.body;

    if (!req.user) {
      return res.status(403).json({ message: 'Нет доступа' });
    }

    let updateQuery = '';
    let updateValues = [];
    let userId;

    if (req.user.role === 'student') {
      userId = req.user.student_id;
      if (!userId)
        return res.status(403).json({ message: 'ID студента не найден' });

      updateQuery = `
          UPDATE students 
          SET first_name = $1, middle_name = $2, last_name = $3, email = $4, birth_date = $5, gender = $6, team_id = $7, in_team = $8
          WHERE student_id = $9
          RETURNING *;
        `;
      updateValues = [
        first_name,
        middle_name,
        last_name,
        email,
        birth_date,
        gender,
        team_id,
        in_team,
        userId,
      ];
    } else if (req.user.role === 'trainer') {
      userId = req.user.trainer_id;
      if (!userId)
        return res.status(403).json({ message: 'ID тренера не найден' });

      updateQuery = `
          UPDATE trainers 
          SET first_name = $1, middle_name = $2, last_name = $3, email = $4, gender = $5
          WHERE trainer_id = $6
          RETURNING *;
        `;
      updateValues = [
        first_name,
        middle_name,
        last_name,
        email,
        gender,
        userId,
      ];
    } else {
      return res.status(403).json({ message: 'Нет доступа' });
    }

    // Выполняем запрос на обновление
    const { rows } = await db.query(updateQuery, updateValues);
    const updatedUser = rows[0];

    // Если передан новый пароль - обновляем его
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const passwordQuery = `
          UPDATE ${req.user.role === 'student' ? 'students' : 'trainers'} 
          SET password_hash = $1 WHERE ${req.user.role === 'student' ? 'student_id' : 'trainer_id'} = $2
        `;
      await db.query(passwordQuery, [hashedPassword, userId]);
    }

    const fixedUser = {
      ...updatedUser,
      birth_date: new Date(updatedUser.birth_date).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
    };

    console.log({ fixedUser });

    res.json({ message: 'Данные успешно обновлены', user: fixedUser });
  } catch (err) {
    console.error('❌ Ошибка обновления профиля:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

export default router;
