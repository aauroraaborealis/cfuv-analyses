import { Request, Response } from 'express';
import { userService } from '../services/userService.js';

class userController {
  async registerStudent(req: Request, res: Response) {
    try {
      const result = await userService.registerStudent(req.body);
      res.status(201).json({ message: 'User registered successfully.', token: result.token });
    } catch (error: any) {
      res.status(error.message === 'Email already exists.' ? 409 : 400).json({ message: error.message });
    }
  }

  async registerTrainer(req: Request, res: Response) {
    try {
      const result = await userService.registerTrainer(req.body);
      res.status(201).json({ message: 'Trainer registered successfully.', token: result.token });
    } catch (error: any) {
      res.status(error.message === 'Email already exists.' ? 409 : 400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await userService.login(email, password);
      res.status(200).json({ message: 'Login successful.', token: result.token });
    } catch (error: any) {
      res.status(error.message === 'User not found.' || error.message === 'Invalid email or password.' ? 401 : 400).json({ message: error.message });
    }
  }
}

export default new userController();
