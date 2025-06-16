import { Request, Response } from 'express';
import profileController from '../src/controllers/profileController';
import { ProfileService } from '../src/services/profileService';

jest.mock('../src/services/profileService');

const mockService = ProfileService as jest.Mocked<typeof ProfileService>;

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('ProfileController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getProfile should return user if req.user is set', async () => {
    const req = { user: { id: 'user1' } } as any as Request;
    const res = mockResponse();

    mockService.getUserProfile.mockResolvedValue({ id: 'user1', name: 'John' });

    await profileController.getProfile(req, res);

    expect(res.json).toHaveBeenCalledWith({ user: { id: 'user1', name: 'John' } });
  });

  it('getProfile should return 403 if req.user is missing', async () => {
    const req = {} as Request;
    const res = mockResponse();

    await profileController.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Нет доступа' });
  });

  it('updateProfile should return updated user if req.user exists', async () => {
    const req = {
      user: { id: 'u1' },
      body: { name: 'Updated', password: 'newpass' },
    } as any as Request;
    const res = mockResponse();

    mockService.updateUserProfile.mockResolvedValue({ id: 'u1', name: 'Updated' });

    await profileController.updateProfile(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Данные успешно обновлены',
      user: { id: 'u1', name: 'Updated' },
    });
  });

  it('updateProfile should return 403 if req.user is missing', async () => {
    const req = {
      body: { name: 'Updated' },
    } as Request;
    const res = mockResponse();

    await profileController.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Нет доступа' });
  });
});
