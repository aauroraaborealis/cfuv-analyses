import { Request, Response } from 'express';
import { userService } from '../services/userService';

class userController {
  async register(req: Request, res: Response) {
    try {
      const { role } = req.body;
      if (role !== 'student' && role !== 'trainer') {
        return res
          .status(400)
          .json({ message: 'Invalid role. Must be "student" or "trainer".' });
      }

      const result = await userService.register(role, req.body);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: 'Registered successfully.',
        token: result.accessToken,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await userService.login(email, password);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: 'Logged in successfully.',
        token: result.accessToken,
      });
    } catch (error: any) {
      res
        .status(
          error.message === 'User not found.' ||
            error.message === 'Invalid email or password.'
            ? 401
            : 400
        )
        .json({ message: error.message });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token' });
      }

      const result = await userService.refreshToken(refreshToken);

      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    res.status(200).json({ message: 'Logged out' });
  }
}

export default new userController();