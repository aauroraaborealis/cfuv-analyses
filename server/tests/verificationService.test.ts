import { VerificationService } from '../src/services/verificationService';
import db from '../src/db';
import { transporter } from '../src/utils/mail';

jest.mock('../src/db');
jest.mock('../src/utils/mail');

const mockDb = db as jest.Mocked<typeof db>;
const mockTransporter = transporter as jest.Mocked<typeof transporter>;

describe('VerificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sendCode should insert/update code and send mail', async () => {
    mockDb.query.mockResolvedValueOnce({} as any);
    mockTransporter.sendMail.mockResolvedValueOnce({} as any);

    await VerificationService.sendCode('test@mail.com', { foo: 'bar' });

    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO verification_codes'),
      expect.arrayContaining(['test@mail.com'])
    );

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@mail.com',
        subject: expect.any(String),
        text: expect.stringContaining('Ваш код подтверждения')
      })
    );
  });

  it('verifyCode should return payload if correct code and not expired', async () => {
    const payload = { name: 'Test' };
    const now = new Date(Date.now() + 1000 * 60);
    mockDb.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{
        code: '123456',
        expires_at: now,
        payload
      }],
    } as any);

    const result = await VerificationService.verifyCode('test@mail.com', '123456');
    expect(result).toEqual(payload);
  });

  it('verifyCode should return null if code is incorrect or expired', async () => {
    const past = new Date(Date.now() - 1000);
    mockDb.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{
        code: '654321',
        expires_at: past,
        payload: {}
      }],
    } as any);

    const result = await VerificationService.verifyCode('test@mail.com', '123456');
    expect(result).toBeNull();
  });

  it('verifyCode should return null if no record found', async () => {
    mockDb.query.mockResolvedValueOnce({
      rowCount: 0,
      rows: [],
    } as any);

    const result = await VerificationService.verifyCode('test@mail.com', '123456');
    expect(result).toBeNull();
  });

  it('delete should call db.query with DELETE', async () => {
    mockDb.query.mockResolvedValueOnce({} as any);
    await VerificationService.delete('test@mail.com');
    expect(mockDb.query).toHaveBeenCalledWith(
      'DELETE FROM verification_codes WHERE email = $1',
      ['test@mail.com']
    );
  });
});
