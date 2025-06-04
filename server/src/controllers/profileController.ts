import { Request, Response } from 'express';
import { ProfileService } from '../services/profileService';

class ProfileController {
  async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(403).json({ message: 'Нет доступа' });
      }

      const user = await ProfileService.getUserProfile(req.user);
      res.json({ user });
      /* istanbul ignore next */ 
    } catch (err: any) {
      /* istanbul ignore next */ 
      console.error('❌ Ошибка получения профиля:', err);
      /* istanbul ignore next */ 
      res.status(500).json({ message: err.message || 'Ошибка сервера' });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(403).json({ message: 'Нет доступа' });
      }

      const updatedUser = await ProfileService.updateUserProfile(req.user, req.body, req.body.password);
      res.json({ message: 'Данные успешно обновлены', user: updatedUser });
      /* istanbul ignore next */ 
    } catch (err: any) {
      /* istanbul ignore next */ 
      console.error('❌ Ошибка обновления профиля:', err);
      /* istanbul ignore next */ 
      res.status(500).json({ message: err.message || 'Ошибка сервера' });
    }
  }
}

export default new ProfileController();
