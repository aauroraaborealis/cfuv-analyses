import { Router } from 'express';
import db from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
router.post('/register', async (req, res) => {
    const { first_name, middle_name, last_name, email, password, birth_date, gender, sport_id, in_team, team_id, } = req.body;
    if (!first_name ||
        !last_name ||
        !email ||
        !password ||
        !birth_date ||
        !gender ||
        !sport_id) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    try {
        const sportCheck = await db.query('SELECT sport_id FROM sports WHERE sport_id = $1', [sport_id]);
        if (sportCheck.rowCount === 0) {
            return res.status(400).json({ message: 'Sport does not exist.' });
        }
        if (team_id) {
            const teamCheck = await db.query('SELECT team_id FROM teams WHERE team_id = $1', [team_id]);
            if (teamCheck.rowCount === 0) {
                return res.status(400).json({ message: 'Team does not exist.' });
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const queryText = `
      INSERT INTO students (student_id, first_name, middle_name, last_name, email, password_hash, birth_date, gender, sport_id, in_team, team_id)
      VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING student_id, email, first_name;
    `;
        const values = [
            first_name,
            middle_name || null,
            last_name,
            email,
            hashedPassword,
            birth_date,
            gender,
            sport_id,
            in_team || false,
            team_id || null,
        ];
        const result = await db.query(queryText, values);
        const user = result.rows[0];
        const token = jwt.sign({
            id: user.student_id,
            email: user.email,
            name: user.first_name,
        }, JWT_SECRET, { expiresIn: '7d' });
        console.log(token);
        res.status(201).json({
            message: 'User registered successfully.',
            token,
        });
    }
    catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Email already exists.' });
        }
        console.error(error);
        res.status(500).json({ message: 'An error occurred during registration.' });
    }
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res
            .status(400)
            .json({ message: 'Email and password are required.' });
    }
    try {
        const userQuery = `
      SELECT student_id, email, first_name, password_hash FROM students WHERE email = $1
    `;
        const userResult = await db.query(userQuery, [email]);
        if (userResult.rowCount === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const user = userResult.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = jwt.sign({
            id: user.student_id,
            email: user.email,
            name: user.first_name,
        }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ message: 'Login successful.', token });
    }
    catch (error) {
        console.error('Ошибка авторизации:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
export default router;
