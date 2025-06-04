import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { VerificationService } from '../services/verificationService';

class userController {
  // async login(req: Request, res: Response) {
  //   try {
  //     const { email, password, role } = req.body;

  //     if (role !== 'student' && role !== 'trainer') {
  //       return res.status(400).json({ message: 'Invalid role.' });
  //     }

  //     const result = await userService.login(email, password, role);
  //     res.status(200).json({ message: 'Login successful.', token: result.token });
  //   } catch (error: any) {
  //     res.status(
  //       error.message === 'User not found.' || error.message === 'Invalid email or password.'
  //         ? 401
  //         : 400
  //     ).json({ message: error.message });
  //   }
  // }

  async registerInit(req: Request, res: Response) {
    try {
      const { role } = req.body;
      if (role !== 'student' && role !== 'trainer') {
        return res
          .status(400)
          .json({ message: 'Invalid role. Must be "student" or "trainer".' });
      }

      await userService.registerInit(role, req.body);
      res.status(200).json({ message: 'Verification code sent to email.' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async registerVerify(req: Request, res: Response) {
    try {
      const { email, code, role } = req.body;
      /* istanbul ignore next */ 
      if (role !== 'student' && role !== 'trainer') {
        return res
          .status(400)
          .json({ message: 'Invalid role. Must be "student" or "trainer".' });
      }

      const result = await userService.registerVerify(role, email, code);
      // res.status(201).json({
      //   message: "Registered successfully.",
      //   accessToken: result.accessToken,
      //   refreshToken: result.refreshToken,
      // });
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true на проде (если https)
        sameSite: 'lax', // ✅ lax — работает на большинстве случаев
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      });

      res.status(200).json({
        message: 'Registered successfully.',
        token: result.accessToken,
      });
    } /* istanbul ignore next */ 
     catch (error: any) {
      /* istanbul ignore next */ 
      res.status(400).json({ message: error.message });
    }
  }

  async loginInit(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      await userService.loginInit(email, password);
      res.status(200).json({ message: 'Verification code sent to email.' });
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

  async loginVerify(req: Request, res: Response) {
    try {
      const { email, code } = req.body;
      const result = await userService.loginVerify(email, code);
      // res.status(201).json({
      //   message: "Logined successfully.",
      //   accessToken: result.accessToken,
      //   refreshToken: result.refreshToken,
      // });
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'lax', 
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: 'Logined successfully.',
        token: result.accessToken,
      });
    } /* istanbul ignore next */  
    catch (error: any) {
      /* istanbul ignore next */ 
      res.status(400).json({ message: error.message });
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
    } /* istanbul ignore next */  
    catch (error: any) {
      /* istanbul ignore next */ 
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

  /* istanbul ignore next */ 
  async resendCode(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
      }

      await VerificationService.resendCode(email);
      res.status(200).json({ message: 'Verification code resent successfully.' });
    }  /* istanbul ignore next */ 
    catch (error: any) {
      console.error('Ошибка повторной отправки кода:', error);
      res.status(500).json({ message: error.message || 'Internal server error.' });
    }
  }
}

export default new userController();
