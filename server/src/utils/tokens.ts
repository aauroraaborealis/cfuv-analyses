import { Router, Request, Response } from 'express';
import db from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

export const generateTokens = (userId: string, role: "student" | "trainer") => {
    const accessToken = jwt.sign(
        { userId, role },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
        { userId, role },
        process.env.REFRESH_SECRET!,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
};


export const saveSession = async (userId: string, role: "student" | "trainer", refreshToken: string, userAgent: string | undefined) => {
    await db.query(
        `INSERT INTO sessions (user_id, role, token, user_agent, expires_at) 
         VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
        [userId, role, refreshToken, userAgent]
    );
};
