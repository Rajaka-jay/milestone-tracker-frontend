import { describe, expect, it } from 'vitest';
import { validateFile, validateLogin, validateMilestone, validateRegister } from '../utils/validators';

describe('validators', () => {
  it('requires an email and password to log in', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({ email: expect.any(String), password: expect.any(String) });
    expect(validateLogin({ email: 'a@b.edu', password: 'x' })).toEqual({});
  });

  it('checks registration passwords', () => {
    const base = { fullName: 'Ada', email: 'ada@uni.edu', password: 'longenough', confirmPassword: 'longenough', role: 'student' };
    expect(validateRegister(base)).toEqual({});
    expect(validateRegister({ ...base, password: 'short', confirmPassword: 'short' }).password).toMatch(/8 characters/);
    expect(validateRegister({ ...base, confirmPassword: 'different' }).confirmPassword).toMatch(/do not match/);
  });

  it('rejects milestones whose deadline precedes the start', () => {
    expect(validateMilestone({ name: 'x', startDate: '2026-02-02', deadline: '2026-02-01' }).deadline).toBeDefined();
  });

  it('accepts only PDF, Word and PowerPoint files', () => {
    expect(validateFile({ name: 'report.pdf', size: 1000 })).toBeNull();
    expect(validateFile({ name: 'slides.PPTX', size: 1000 })).toBeNull();
    expect(validateFile({ name: 'photo.png', size: 1000 })).toMatch(/PDF, Word and PowerPoint/);
    expect(validateFile({ name: 'huge.pdf', size: 50 * 1024 * 1024 })).toMatch(/smaller than/);
  });
});
